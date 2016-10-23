$(window).on('load', function() {

	var commandList = {
		'create': {
			isOnline: true,
			validArgs: [
				{ name: 'name', required: true }, 
				{ name: 'password', required: false }, 
				{ name: 'motd', required: false }
			]
		},
		'delete': {
			isOnline: true,
			validArgs: [
				{ name: 'name', required: true }
			]
		},
		'update': {
			isOnline: true,
			validArgs: [
				{ name: 'name', required: true }, 
				{ name: 'password', required: false }, 
				{ name: 'motd', required: false }
			]
		},
		'join': {
			isOnline: true,
			validArgs: [
				{ name: 'name', required: true }, 
				{ name: 'password', required: false }
			]
		},
		'leave': {
			isOnline: true,
			validArgs: []
		},
		'motd': {
			isOnline: true,
			validArgs: []
		},
		'help': {
			isOnline: false,
			validArgs: []
		}
	}

	// Layout breakpoint values

	var breakpointSmall		=	768;
	var breakpointMedium	=	992;
	var breakpointLarge		=	1200;

	var indexLogo = new ichatLogo('.logo');
	var logoBlink = new BlinkCursor('.logo__text');

	var regForm = new ichatuForm('#registration_form');
	var loginForm = new ichatuForm('#login_form');

	var introFold = new ichatuFold('#intro');
	var actionFold = new ichatuFold('#action');

	var statusbar = window.statusbar = new ichatuStatusbar('.statusbar');
	var sidebar = window.sidebar = new ichatuSidebar('.sidebar');

	var shell = new Shell('#shell_input', '#shell_output');
	var interpreter	=	new Interpreter({
		COMMAND_PREFIX: '/',
		ARGUMENT_PREFIX: '--'
	});
	var socketClient = new SocketClient();
	var commandHandler	=	new CommandHandler(socketClient, shell, sidebar);



	logoBlink.start();



	var sectionSwitch = new SectionSwitch("#action", {
		itemSelec: 'section'
	});



	$('#register').click(function() {
		sectionSwitch.switch('#switch2', 'rotateOut', 'rotateIn');
	});

	$('.login').click(function() {
		sectionSwitch.switch('#switch1', 'rotateOut', 'rotateIn');
	});



	regForm.onCancel.addListener(function() {
		sectionSwitch.switch('#switch0', 'rotateOut', 'rotateIn');
	});

	regForm.onSubmit.addListener(function(event) {
		
		$.ajax('/register', {

			success: function(data) {

				if(data.success === true)
					sectionSwitch.switch('#switch3', 'rotateOut', 'rotateIn');
				else if(data.error)
					regForm.setValidationText(data.error);
				else 
					regForm.setValidationText('Unexpected error');
				
			},
			error: function(err) {
				regForm.setValidationText('Unexpected error');
			},
			type: 'POST',
			data: event.data

		});

	});

	loginForm.onSubmit.addListener(function(event) {
		socketClient.establishConnection(socketClient.createRequest(null, event.data));
	});

	socketClient.onConnect.addListener(function() {
		statusbar.statusOn();
	});

	socketClient.onReconnect.addListener(function() {
		shell.out.printLine('CONNECTION RESTORED', shell.out.type.SUCCESS);
		socketClient.transmitPacket(socketClient.createRequest('list', {}));
	});

	socketClient.onDisconnect.addListener(function() {

		statusbar.statusOff();
		sidebar.list.setTitle('Unavailable');
		sidebar.list.emptyList();
		
		if(socketClient.session.room) {
			
			shell.out.printEmptyLine();
			shell.out.printLine('You have been removed from room "' + socketClient.session.room + '".', shell.out.type.ERROR);
			shell.out.printEmptyLine();

		}
		
		shell.out.printEmptyLine();	
		shell.out.printLine('CONNECTION TERMINATED', shell.out.type.ERROR);
		shell.out.printEmptyLine();

	});

	socketClient.onAuthSuccess.addListener(function(packet) {

		loginForm.setValidationText('');
		socketClient.transmitPacket(socketClient.createRequest('list', {}));

		if($(window).width() > breakpointMedium) {
			introFold.collapse('slideOutLeft');
			actionFold.collapse('slideOutRight');
		} else {
			introFold.collapse('slideOutUp');
			actionFold.collapse('slideOutDown');
		}

	});

	introFold.onCollapseEnd.addListener(function() {
		statusbar.expand('slideInDown');
	});

	actionFold.onCollapseEnd.addListener(function() {
		$('.shell__input').show();
		animateCSS('.shell__input', 'slideInUp', function() {

		shell.out.printHighlight('WELCOME TO ICHATU !!!', shell.out.type.SUCCESS);
		shell.out.printHighlight(
			'Please note that this is only a prototype and not a finished product. ' +
			'The application does not provide any security whatsoever, beyond very basic authentication.'
			, shell.out.type.WARNING);
		shell.out.printHighlight('COMMAND LIST', shell.out.type.SYSTEM);
		shell.out.printLines([
		'/join --name (value) /* Join an existing room */',
		'/leave /* Leave an existing room */',
		'/motd /* Show the room\'s message of the day */',
		'/create --name (value) ?--password (value) ?--motd (value) /* Create a new room */',
		'/update --name (value) ?--password (value) ?--motd (value) /* Update an existing room */',
		'/delete --name (value) /* Delete an existing room */',
		], shell.out.type.SYSTEM);
		shell.out.printEmptyLine();

		if($(window).width() > breakpointLarge) 
			sidebar.expand('slideInRight');

		});
	});

	socketClient.onAuthFailure.addListener(function(packet) {
		loginForm.setValidationText(packet.parameters.error);
	});

	loginForm.onCancel.addListener(function() {
		sectionSwitch.switch('#switch0', 'rotateOut', 'rotateIn');
		loginForm.setValidationText('');
	});
	
	statusbar.infoBtn.click(function() {
		sidebar.toggle('slideInRight', 'slideOutRight');
	});

	shell.in.onSubmit(function(input) {

		interpreter.interpret(input, commandList, function(command, args, connReq) { 

			var packet = socketClient.createRequest(command, args);

			socketClient.isConnected(function() {

				if(connReq) 
					socketClient.transmitPacket(packet, function($response) {

						var date = new Date(packet.timestamp).format("h:MM:ss TT", new Date());
						var content = packet.parameters.content;

						var msg = '[' + date + ']:' + '<You>' + ' ' + content;

						if($response.parameters.status === 200) 
							shell.out.printLine(msg, shell.out.type.DEFAULT);

					});
				else 
					commandHandler.offlineHandler(packet);

			}, function() {
				commandHandler.offlineHandler(packet);
			});

		}, function(error) {
			shell.out.printEmptyLine();
			shell.out.printLine(error, shell.out.type.ERROR);
			shell.out.printEmptyLine();
		});

	});

	commandHandler.responseHandler();

});