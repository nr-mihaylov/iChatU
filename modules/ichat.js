var icp = require('./icp');
var sl = require('./ichatServer');
var colorz = require('./colorz');
var roomHandler = require('./roomHandler');

function init(io, socket, data) {

	try {

		sl(socket, io);
		var session = socket.session;
		session.color = colorz.getColor();

		socket.on('disconnect', function() {

			try {

				if(session.room) {

					var room = session.room;

					delete room.users[socket.id];
					socket.leave(room.name);
					

					socket.broadcastToRoom(room.name, 'icp', icp.createBroadcast('leave', { 
						'alias': session.alias 
					}));

					room = undefined;

				}

			} catch(err) {
				socket.respondToRequest('icp', icp.createResponse('ioerror', { 'error': err }));
			}

		});

		socket.on('icp', function(packet, confirm) {

			try {

				var err = null;

				switch(packet.label) {

					case 'message':

						if(!session.room) {
							err = 'You are not in a room.';
							break;
						}

						var content = packet.parameters.content;

						var isWAT = content	===	'{} + {}'	||	
									content	===	'[] + []'	||	
									content	===	'{} + []'	||	
									content	===	'[] + {}'	
									? true	
									: false;

						if(isWAT) {

							socket.respondToRequest('icp', icp.createHtmlResponse('message', { 
								'markup': '<img class="wat" src="/images/wat.png" />' 
							}));

						} else {

							confirm(icp.createResponse('icp', { 'status': 200 }));

							socket.broadcastToRoom(session.room.name, 'icp', icp.createBroadcast('message', { 
								'alias': session.alias,
								'color': session.color,
								'content': content
							}));

						}

					break;

					case 'join': 

						var name = packet.parameters.name;
						var password = packet.parameters.password;
						var room = roomHandler.retrieveRoom(name);

						if(session.room) {
							err = 'You are already in a room.';
							break;
						}

						if(!room) {
							err = 'No such room exists.';
							break;
						}

						if(room.password) 
							if(!password) {
								err = 'Password required.';
								break;
							} else
								if(room.password !== password) {
									err = 'Invalid password.';
									break;
								}

						session.room = room;
						session.room.users[socket.id] = session.alias;
						socket.join(name);

						socket.respondToRequest('icp', icp.createResponse('join', {
							'roomName': 	room.name,
							'roomMotd': 	room.motd
						}));
						socket.broadcastToRoom(room.name, 'icp', icp.createBroadcast('join', { 
							'alias': session.alias
						}));

					break;

					case 'leave':

						if(!session.room) {
							err = 'You are not in a room.';
							break;
						}

						var room = session.room;

						delete room.users[socket.id];
						socket.leave(room.name);
						

						socket.respondToRequest('icp', icp.createResponse('leave', {
							'roomName': room.name
						}));
						socket.broadcastToRoom(room.name, 'icp', icp.createBroadcast('leave', { 
							'alias': session.alias
						}));

						session.room = null;

					break;

					case 'list':

						socket.respondToRequest('icp', icp.createResponse('list', { 
								'roomList': roomHandler.getRoomList()
						}));

					break;

					case 'users':

						if(!session.room) {
							err = 'You are not in a room.';
							break;
						}

						var room = session.room;
						var userList = [];

						for(var id in room.users) 
							userList.push(room.users[id]);

						socket.respondToRequest('icp', icp.createResponse('users', { 
								'userList': userList
						}));

					break;

					case 'create': 

						var name = packet.parameters.name;
						var password = packet.parameters.password;
						var motd = packet.parameters.motd;
						var room = roomHandler.retrieveRoom(name);

						if(room) {
							err = 'Room already exists.';
							break;
						}

						roomHandler.newRoom(name, password, motd, session.username, function() {

							socket.respondToRequest('icp', icp.createResponse('create', { 
									'roomName': name,
									'roomPassword': password,
									'roomMotd': motd
							}));

							socket.broadcastToAll('icp', icp.createBroadcast('create', { 
								'roomName': name,
								'roomMotd': motd
							}));

						});

					break;

					case 'update':

						var name = packet.parameters.name;
						var password = packet.parameters.password;
						var motd = packet.parameters.motd;
						var room = roomHandler.retrieveRoom(name);

						if(!room) {
							err = 'Room doesn\'t exists.';
							break;
						}

						if(session.username !== room.admin) {
							err = 'Insufficient permissions.';
							break;
						}

						roomHandler.modifyRoom(name, password, motd, function(room) {

							socket.respondToRequest('icp', icp.createResponse('update', { 
								'roomName': room.name,
								'roomPassword': room.password,
								'roomMotd': room.motd
							}));

							socket.broadcastToRoom(room.name, 'icp', icp.createBroadcast('update', { 
								'roomName': room.name,
								'roomPassword': room.password,
								'roomMotd': room.motd
							}));

						});

					break;

					case 'delete':

						var name = packet.parameters.name;
						var room = roomHandler.retrieveRoom(name);

						if(!room) {
							err = 'Room doesn\'t exists.';
							break;
						}

						if(session.username !== room.admin) {
							err = 'Insufficient permissions.';
							break;
						}

						roomHandler.removeRoom(name, function(room) {		

							socket.respondToRequest('icp', icp.createResponse('delete', { 
								'roomName': room.name,
								'current': (room.name === (session.room ? session.room.name : null))
							}));

							socket.broadcastToAll('icp', icp.createBroadcast('delete', { 
								'roomName': room.name
							}));

							socket.getAllInRoom(room.name, function(users) {

								if(users)
									users.forEach(function(userSocket) {

										userSocket.leave(room.name);
										userSocket.session.room = null;

									});

							});
						});

					break;

					case 'motd':

						if(!session.room) {
							err = 'You are not in a room.';
							break;
						}

						socket.respondToRequest('icp', icp.createResponse('motd', { 'roomMotd': session.room.motd }));

					break;

					default: 

						err = 'Unknown command.';

					break;

				}

				if(err) 
					socket.respondToRequest('icp', icp.createResponse('ioerror', { 'error': err }));

				err = null;

			} catch(err) {
				socket.respondToRequest('icp', icp.createResponse('ioerror', { 'error': err }));
			}

		});

	} catch(err) {
		socket.respondToRequest('icp', icp.createResponse('ioerror', { 'error': err }));
	}

}

module.exports = {

	init: init

}