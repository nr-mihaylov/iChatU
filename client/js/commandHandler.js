function CommandHandler(socketClient, shell, sidebar) {

	var sc = socketClient;
	var sh = shell;
	var sb = sidebar;

	function offlineHandler(packet) {

		switch(packet.label) {

			case 'help':

				sh.out.printHighlight('Command list', sh.out.type.SYSTEM);
				sh.out.printLines([
				'/join --name (value) /* Join an existing room */',
				'/leave /* Leave an existing room */',
				'/motd /* Show the room\'s message of the day */',
				'/create --name (value) ?--password (value) ?--motd (value) /* Create a new room */',
				'/update --name (value) ?--password (value) ?--motd (value) /* Update an existing room */',
				'/delete --name (value) /* Delete an existing room */',
				], sh.out.type.SYSTEM);

			break;

			default: 
				if(packet.type === 'message') {

					shell.out.printEmptyLine();
					sh.out.printLine('You cannot send messages, while offline.', sh.out.type.ERROR);
					shell.out.printEmptyLine();

				}
				else {

					shell.out.printEmptyLine();
					sh.out.printLine('This command is not available, while offline.', sh.out.type.ERROR);
					shell.out.printEmptyLine();

				}

		}

	}

	function responseHandler() {

		sc.onMessage.addListener(function(packet) {

			switch(packet.label) {

				case 'message':

					if(packet.format === 'html') 
						sh.out.printRaw(packet.parameters.markup);
					else {

						var date = new Date(packet.timestamp).format("h:MM:ss TT", new Date());
						var alias = packet.parameters.alias;
						var content = packet.parameters.content;
						var color = packet.parameters.color;

						var msg = '[' + date + ']:' + '<' + alias + '>' + ' ' + content;

						sh.out.printLine(msg, color);
					}

				break;

				case 'join':

					if(packet.type === 'response') {

						sc.session.room = packet.parameters.roomName;

						var msg			=	'Welcome to ' + packet.parameters.roomName + '!';
						var motd		=	packet.parameters.roomMotd;

						sc.transmitPacket(sc.createRequest('users', {}));

						if(motd)
							msg = msg + ' MOTD: ' + motd;

						sh.out.printHighlight(msg, sh.out.type.SYSTEM);

					} else if(packet.type === 'broadcast') {
						
						shell.out.printEmptyLine();
						sh.out.printLine(packet.parameters.alias + ' has joined the room.', sh.out.type.SYSTEM);
						shell.out.printEmptyLine();

						if(sb.list.listType === 1) 
							sb.list.addItemToList(packet.parameters.alias);

					}

				break;

				case 'leave':

					if(packet.type === 'response') {

						sc.session.room = null;
						shell.out.printEmptyLine();
						sh.out.printLine('You have left room "' + packet.parameters.roomName + '".', sh.out.type.SYSTEM);
						shell.out.printEmptyLine();

						sc.transmitPacket(sc.createRequest('list', {}));

					} else if(packet.type === 'broadcast') {
						
						sh.out.printLine(packet.parameters.alias + ' has left the room.', sh.out.type.SYSTEM);
						if(sb.list.listType === 1) 
							sb.list.removeListItem(packet.parameters.alias);
					} 

				break;

				case 'list':

				var roomList = packet.parameters.roomList;

					sb.list.setTitle('Room list');

					if(roomList.length > 0) {
						
						sb.list.emptyList();
						sb.list.listType = 0;
						sb.list.addItemsToList(roomList);

					}

				break;

				case 'users':

					var usersList = packet.parameters.userList;

					sb.list.setTitle('User list');

					if(usersList.length > 0) {
						
						sb.list.emptyList();
						sb.list.listType = 1;
						sb.list.addItemsToList(usersList);

					}


				break;

				case 'create':

					var roomName = packet.parameters.roomName;
					var roomPassword = packet.parameters.roomPassword;
					var roomMotd = packet.parameters.roomMotd;

					if(!roomPassword) 
						roomPassword = 'none';
					if(!roomMotd) 
						roomMotd = 'none';

					var msg =	'Room created! ' + 
								'Name: ' + roomName + 
								', Password: ' + roomPassword + 
								', Message of the day: ' + roomMotd;

					if(!sc.session.room || packet.type === 'response') 
						sh.out.printHighlight(msg, sh.out.type.SUCCESS);

					if(sb.list.listType === 0) 
						sb.list.addItemToList(roomName);

				break;

				case 'update':

					var roomName = packet.parameters.roomName;
					var roomPassword = packet.parameters.roomPassword;
					var roomMotd = packet.parameters.roomMotd;

					if(!roomPassword) 
						roomPassword = 'none';
					if(!roomMotd) 
						roomMotd = 'none';

					var msg =	'Password: ' + roomPassword + 
								', Message of the day: ' + roomMotd;

					if(packet.type === 'response') 
						sh.out.printHighlight('Room ' + roomName + ' updated! ' + msg, sh.out.type.SUCCESS);
					else if(packet.type === 'broadcast')
						sh.out.printHighlight('Room updated! ' + msg, sh.out.type.SYSTEM);

				break;

				case 'delete':

					var name = packet.parameters.roomName;
					var current = packet.parameters.current;

					if(packet.type === 'response') {

						shell.out.printEmptyLine();
						sh.out.printLine('Room "' + name + '" has been deleted.', sh.out.type.SUCCESS);
						shell.out.printEmptyLine();

						if(current) {

							sc.session.room = null;
							sc.transmitPacket(sc.createRequest('list', {}));

							shell.out.printEmptyLine();
							sh.out.printLine('You have been removed from room "' + name + '".', sh.out.type.WARNING);
							shell.out.printEmptyLine();
						}

					} else if(packet.type === 'broadcast') {

						if(name === sc.session.room) {

							sc.session.room = null;
							sc.transmitPacket(sc.createRequest('list', {}));

							shell.out.printEmptyLine();
							sh.out.printLine('Room "' + name + '" has been deleted.', sh.out.type.WARNING);
							shell.out.printEmptyLine();
							sh.out.printLine('You have been removed from room "' + name + '".', sh.out.type.WARNING);	
							shell.out.printEmptyLine();
						}

					}

					if(sb.list.listType === 0) 
						sb.list.removeListItem(name);

				break;

				case 'motd':

					var motd = packet.parameters.roomMotd;

					if(motd)
						sh.out.printHighlight('MOTD: ' + motd, sh.out.type.SYSTEM);
					else {
						shell.out.printEmptyLine();
						sh.out.printLine('MOTD unavailable.', sh.out.type.WARNING);
						shell.out.printEmptyLine();
					}

				break;

				case 'ioerror':

					console.log(packet.parameters.error);
					shell.out.printEmptyLine();
					sh.out.printLine(packet.parameters.error, sh.out.type.ERROR);
					shell.out.printEmptyLine();

				break;

				default: //...

			}
		});
	}

	return {
		offlineHandler: offlineHandler,
		responseHandler: responseHandler
	}
}