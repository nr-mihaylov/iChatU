function animateCSS(elementSelec, animation, afterAnimate) {

	var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

	$(elementSelec)
		.addClass('animated')
		.addClass(animation)
		.one(animationEnd, function() {

			$(this)
				.removeClass('animated')
				.removeClass(animation);

				if(afterAnimate) 
					afterAnimate(this);

		});

}

function CustEvent() {

	var listenerArray = [];

	return {
		addListener: function(listener) {
			listenerArray.push(listener);
		},
		removeListener: function(listener) {
			for(var i=0; i<listenerArray.length; i++) {
				
				if(listener === listenerArray[i]) 
					listenerArray.splice(i,1);
				break;

			}
		},
		removeAllListeners: function() {
			listenerArray.splice(0, listenerArray.length);
		},
		emit: function(event) {
			if(listenerArray.length > 0)
				for(var i=0; i<listenerArray.length; i++) 
					listenerArray[i](event);
		}
	}

}

function InputVault(limit) {
 
	var recordArray = [];
	var index = null;

	return {

		addRecord: function (record) { 
			
			recordArray.push(record); 
			index = recordArray.length;
			
			if(recordArray.length > limit) {
				recordArray = recordArray.slice(1,limit + 1);
			}

		},
		getRecord: function(direction) {

			index = direction? --index : ++index;

			if(recordArray.length === 0 ) 
				return '';

			if(index < 0) 
				index = recordArray.length - 1;

			if(index > recordArray.length - 1) 
				index = 0;

			return recordArray[index];

		}

	}

}
function ichatLogo(selec) {

	var logoImgSelector		=	selec + ' .logo__img';
	var logoTextSelector	=	selec + ' .logo__text';

	/**
	* Alter the font size of the logo text so that it is half of the 
	* size of the logo itself. We use javascript since there is no 
	* good solution with css alone. Since the logo image is the same 
	* size as the entire logo, it is used as a reference.
	*/

	function adjustLogoText() {
		$(logoTextSelector).css('font-size', $(logoImgSelector).height()/2);
	}

	adjustLogoText();
	$(window).resize(adjustLogoText);

}


//========================================================================================


/**
* Add a blinking underscore to the end of the element content 
* specified by the selector parameter.
*
* @param {string} selector - A selector specifying the element(s), that 
* must be altered.
*/

function BlinkCursor(selec) {

	id = null;

	return {
		start: function() {

			var element = $(selec);

			if(element)
				id = setInterval(function() {

					var text = element.text();
					var suffix = text.slice(text.length - 1, text.length);

					if(suffix === '_') 
						element.text(text.slice(0, text.length - 1));
					else
						element.text(element.text() + '_');


				}, 600);

		},
		stop: function () {
			if(id) clearInterval(id);
		}
	}
}


//========================================================================================


function ichatuFold(selec) {

	var onCollapseEndEvent = new CustEvent();
	var onExpandEndEvent = new CustEvent();

	return {
		collapse: function(animation) {
			
			animateCSS(selec, animation, function(elements) {
				$(elements).hide();
				onCollapseEndEvent.emit();
			});

		},
		expand: function(animation) {
			
			$(selec).show();

			animateCSS(selec, animation, function(elements) {
				onExpandEndEvent.emit();
			});

		},
		onCollapseEnd: {
			addListener: onCollapseEndEvent.addListener,
			removeListener: onCollapseEndEvent.removeListener,
			removeAllListenerse: onCollapseEndEvent.removeAllListenerse
		},
		onExpandEnd: {
			addListener: onExpandEndEvent.addListener,
			removeListener: onExpandEndEvent.removeListener,
			removeAllListenerse: onExpandEndEvent.removeAllListenerse
		}
	}
}


//========================================================================================


/**
* The SectionSwitch component is responsible for changing between 
* html element groups. Objects of this type use the CSS animations.
* 
* @param {string} container - a selector specifying the container element(s).
*
* @param {Object} opts - optional intilized object for a number of values, such 
* as the children element(s) of the container, that will be switched between.
*/

function SectionSwitch(container, opts) {

	if(!container) 
		throw new Error('ReferenceError: missing container argument');

	opts				=	opts				||	{};
	opts.itemSelec		=	opts.itemSelec		||	'>*';
	opts.visibleSelec	=	opts.visibleSelec	||	'switch--visible';
	opts.hiddenSelec	=	opts.hiddenSelec	||	'switch--hidden';

	var items = $(container + ' ' + opts.itemSelec);

	// Add missing classes & ids

	for(var i = 0; i<items.length; i++) {

		if($(items[i]).hasClass(opts.visibleSelec))
			var currentItem = items[i];
		else if(!$(items[i]).hasClass(opts.hiddenSelec))
			$(items[i]).addClass(opts.hiddenSelec);

		$(items[i]).attr('id', 'switch'+i);

	}

	var animationFlag = false;

	return {
	
		switch: function (target, exitAnimation, enterAnimation) {

			if(!animationFlag) {

				animationFlag = true;

				animateCSS(currentItem, exitAnimation, function(elements) {

					$(elements)
						.removeClass(opts.visibleSelec)
						.addClass(opts.hiddenSelec);

					$(target)
						.removeClass(opts.hiddenSelec)
						.addClass(opts.visibleSelec);

					animateCSS(target, enterAnimation, function(elements) {
						currentItem = $(target);
						animationFlag = false;
					});

				});

			}

		}

	}
}


//========================================================================================


function ichatuForm(selec, opts) {

	opts					=	opts					||	{};
	opts.adjustBreakpoint	=	opts.adjustBreakpoint	||	768;
	opts.alternateModSelec	=	opts.alternateModSelec	||	'form--alternate';

	var fieldSelec = selec + ' .form__field';
	var validationSelec = selec + ' .form__validation';
	var submitSelec = selec + ' .form__submit';
	var cancelSelec = selec + ' .form__cancel';
	
	var submitEvent = new CustEvent();
	var cancelEvent = new CustEvent();

	var fields = $(fieldSelec);

	function extractFormData(fieldsSelec) {

		var data = {};

		for(var i=0; i<fields.length; i++) 
			data[$(fields[i]).attr('name')] = $(fields[i]).val();

		return data;

	}

	$(selec).keypress(function(event) {

		if(event.keyCode === 13) 
			submitEvent.emit({ data: extractFormData($(fieldSelec)) });	

	});

	$(submitSelec).click(function() {
		submitEvent.emit({ data: extractFormData($(fieldSelec)) });
	});

	$(cancelSelec).click(function() {
		cancelEvent.emit();
	});

	/**
	* The minimum screen size for the application is 3.5 inches or 
	* equivalent to the screen size of the iphone 4. On such a device
	* in landscape mode, forms with three fields are too big and cause 
	* the buttons to partially overflow outside the screen, hence the 
	* usability is reduced. To counter this the form actionbar is positioned 
	* on the right side of the form fields instead of below. This is limited 
	* to small screens only. Adding the form--alternate class overrides
	* some of the css styles in order to apply the layout changes.
	*/

	function adjustLayout() {

		var w = $(window).width();
		var h = $(window).height();

		if(w < opts.adjustBreakpoint && h < opts.adjustBreakpoint && w > h) 
			$(selec).addClass(opts.alternateModSelec);
		else 
			$(selec).removeClass(opts.alternateModSelec);

	}

	adjustLayout();
	$(window).resize(adjustLayout);

	return {
		setValidationText: function(text) {
			$(validationSelec).text(text);
		},
		onSubmit: {
			addListener: submitEvent.addListener,
			removeListener: submitEvent.removeListener,
			removeAllListenerse: submitEvent.removeAllListenerse
		},
		onCancel: {
			addListener: cancelEvent.addListener,
			removeListener: cancelEvent.removeListener,
			removeAllListenerse: cancelEvent.removeAllListenerse
		}
	}

}


//========================================================================================


function ichatuStatusbar(selec) {

	var statusSelec = $(selec + " #status_beat");
	var infoSelec = $(selec + " #info_btn img");

	var onCollapseEndEvent = new CustEvent();
	var onExpandEndEvent = new CustEvent();

	return {
		statusBeat: $(statusSelec),
		infoBtn: $(infoSelec),
		collapse: function(animation) {
			
			animateCSS(selec, animation, function(elements) {
				$(elements).hide();
				onCollapseEndEvent.emit();
			});

		},
		expand: function(animation) {
			
			$(selec).show();
			
			animateCSS(selec, animation, function(elements) {
				onExpandEndEvent.emit();
			});

		},
		statusOn: function() {
			
			$(statusSelec)
				.removeClass('statusbar__item--off')
				.addClass('statusbar__item--on');

		},
		statusOff: function() {

			$(statusSelec)
				.removeClass('statusbar__item--on')
				.addClass('statusbar__item--off');

		},
		onCollapseEnd: {
			addListener: onCollapseEndEvent.addListener,
			removeListener: onCollapseEndEvent.removeListener,
			removeAllListenerse: onCollapseEndEvent.removeAllListenerse
		},
		onExpandEnd: {
			addListener: onExpandEndEvent.addListener,
			removeListener: onExpandEndEvent.removeListener,
			removeAllListenerse: onExpandEndEvent.removeAllListenerse
		}
	}

}


//========================================================================================


function ichatuSidebar(selec, opts) {

	opts					=	opts					||	{};
	opts.adjustBreakpoint	=	opts.adjustBreakpoint	||	1200;

	var headerSelec = selec + ' .sidebar__header';
	var bodySelec = selec + ' .sidebar__body';

	var onCollapseEndEvent = new CustEvent();
	var onExpandEndEvent = new CustEvent();

	var listType = 0;

	var displayFlag = false;

	$(window).resize(function() {

		if($(window).width() > opts.adjustBreakpoint) 
			$(selec).show();
		else if(!displayFlag)
			$(selec).hide();

	});

	return {

		collapse: function(animation) {
			
			displayFlag = false;

			animateCSS(selec, animation, function(elements) {
				$(elements).hide();
				onCollapseEndEvent.emit();
			});

		},
		expand: function(animation) {
			
			displayFlag = true;

			$(selec).show();
			animateCSS(selec, animation, function(elements) {
				onExpandEndEvent.emit();
			});

		},
		toggle: function(expandAnimation, collapseAnimation) {

			if($(selec).is(':hidden')) 
				this.expand(expandAnimation);
			else 
				this.collapse(collapseAnimation);

		},
		list: {
			setTitle: function(title) {
				$(headerSelec).text(title);
			},
			addItemToList: function(item) {
				
				var item = $('<div>'+ item +'</div>')
					.addClass('default')
					.appendTo(bodySelec);

				animateCSS(item, 'fadeIn');

			},
			removeListItem: function(item) {

				$(bodySelec).find('div').each(function(index, element) {
					
					element = $(element);

					if(element.text() === item)
						animateCSS(element, 'fadeOut', function(elements) {
							elements.remove();
						}); 
						
				});
			},
			addItemsToList: function(items) {
				
				for(var i=0; i<items.length; i++) 
					this.addItemToList(items[i]);

			},
			emptyList: function() {
				$(bodySelec).empty();
			},
			listType: listType
		},
		onCollapseEnd: {
			addListener: onCollapseEndEvent.addListener,
			removeListener: onCollapseEndEvent.removeListener,
			removeAllListenerse: onCollapseEndEvent.removeAllListenerse
		},
		onExpandEnd: {
			addListener: onExpandEndEvent.addListener,
			removeListener: onExpandEndEvent.removeListener,
			removeAllListenerse: onExpandEndEvent.removeAllListenerse
		}

	}

}
function Shell(inputSelector, outputSelector) {

	var input = $(inputSelector);
	var inputVault = new InputVault(100);
	var onSubmitEvent = new CustEvent();

	$(outputSelector).perfectScrollbar({
		wheelSpeed: 1,
		suppressScrollX: true
	}); 

	function setContent(content) {
		input.val(content);

		setTimeout(function() {
			input[0].selectionStart = input[0].selectionEnd = content.length;
		});
	}

	function getContent(input) {
		return input.val();
	}

	function clearInput(input) {
		input.val('');
	}

	input.data('flag', true);
	input.keypress(function(event) {

		if(event.which === 13) {
			
			$(this).data('flag', false);
			$(this).attr('rows', 1);

			var content = getContent(input);

			inputVault.addRecord(content);
			onSubmitEvent.emit(content);

		} else 
			$(this).data('flag', true);

	});

	input.on('input', function() {

		if($(this).data('flag')) {

			$(this).attr('rows', 1);
			$(this).attr('rows', Math.ceil(($(this).prop('scrollHeight') - $(this).outerHeight()) / $(this).height()) + 1);

		} else {
			$(this).data('flag', true);
			clearInput(input);
		}

	});

	input.keydown(function(eventx) {

		var key = event.keyCode;

		if(key === 38)
			setContent(inputVault.getRecord(true));

		if(key === 40)
			setContent(inputVault.getRecord(false));

	});

	return {
		in: {
			onSubmit: onSubmitEvent.addListener,
			unbindSubmit: onSubmitEvent.removeListener,
			unbindAllSubmit: onSubmitEvent.removeAllListeners
		},
		out: ( new TextFormatter(outputSelector) )
	}
}

var TextFormatter = function(selec, opts) {

	opts = opts || {};

	const SYMBOL_TOP_BORDER		=	opts.SYMBOL_TOP_BORDER || '=';
	const SYMBOL_SIDE_BORDER	=	opts.SYMBOL_SIDE_BORDER || '|';
	const PADDING_TOP			=	opts.PADDING_TOP || 1;
	const PADDING_SIDE			=	opts.PADDING_SIDE || 1;
	const SAMPLE_SELECTOR		=	opts.SAMPLE_SELECTOR || '.shell__sample';

	var sampleW					=	$(SAMPLE_SELECTOR).width();
	var sampleH					=	$(SAMPLE_SELECTOR).height();
	var container				=	$(selec);
	var containerWidth			=	container.height() < container.width() 
										? container.height() 
										: container.width();

	var lineMaxSymbols			=	Math.floor(containerWidth/sampleW);
	var contentMaxSymbols		=	lineMaxSymbols - 2 * (SYMBOL_SIDE_BORDER.length + PADDING_SIDE);

	function generateRaw(content) {

		var item = $('<div></div>')
			.html(content)
			.appendTo(container);

		animateCSS(item, 'fadeIn');

	} 

	function generateLine(content, type) {

		var item =  $('<div></div>').html(
			
			$('<pre></pre>')
				.addClass('shell__output-line')
				.text(content)
				
			)
		.css('color', type)
		.appendTo(container);

		animateCSS(item, 'fadeIn');

	}

	function generateUniform(symbol, length, type) {

		var item = $('<div><pre>'+ Array(length + 1).join(symbol) + '</pre></div>')
		.css('color', type)
		.appendTo(container);

		animateCSS(item, 'fadeIn');

	}

	function generateEmptyRow(length, type) {

		var item = $(
			'<div><pre>' + 
			SYMBOL_SIDE_BORDER + 
			Array(PADDING_SIDE + 1).join(' ') + 
			Array(length - ( (PADDING_SIDE * 2) + 1) ).join(' ') + 
			Array(PADDING_SIDE + 1).join(' ') + 
			SYMBOL_SIDE_BORDER + 
			'</pre></div>'
		)
		.css('color', type)
		.appendTo(container);

		animateCSS(item, 'fadeIn');

	}

	function generateRow(content, type) {

		var whiteSpace = contentMaxSymbols - content.length;

		var item = $(
			'<div><pre>' + 
			SYMBOL_SIDE_BORDER + 
			Array(PADDING_SIDE + 1).join(' ') + 
			content + 
			Array(PADDING_SIDE + whiteSpace + 1).join(' ') + 
			SYMBOL_SIDE_BORDER + 
			'</pre></div>'
		)
		.css('color', type)
		.appendTo(container);

		animateCSS(item, 'fadeIn');

	}

	function generateContent(content, type) {

		if(content.length > contentMaxSymbols) {

			var current = content.slice(0, contentMaxSymbols),
			next = content.slice(contentMaxSymbols, contentMaxSymbols.length);

			generateRow(current, type);
			generateContent(next, type);

		} else {
			generateRow(content, type);
		}

	}

	function scroll() {
		container.scrollTop(container.prop('scrollHeight'));
		container.perfectScrollbar('update');
	}

	return {

		printRaw: function(content, type) {
			generateRaw(content, type);
			scroll();
		},
		printLine: function(content, type) {
			generateLine(content, type);
			scroll();
		},
		printLines: function(content, type) {
			for(var i = 0; i<content.length; i++)
				generateLine(content[i], type);

			scroll();
		},
		printEmptyLine: function() {
			generateUniform(' ', lineMaxSymbols);
			scroll();
		},
		printHighlight: function(content, type) {
			generateUniform(' ', lineMaxSymbols, type);
			generateUniform(SYMBOL_TOP_BORDER, lineMaxSymbols, type);
			generateEmptyRow(lineMaxSymbols, type);
			generateContent(content, type);
			generateEmptyRow(lineMaxSymbols, type);
			generateUniform(SYMBOL_TOP_BORDER, lineMaxSymbols, type);
			generateUniform(' ', lineMaxSymbols, type);
			scroll();
		},		
		type: {
			DEFAULT:	'#EEEEEE',
			SUCCESS:	'#5CFF73',
			WARNING:	'#FF8143',
			ERROR:		'#FF5750',
			SYSTEM:		'#42FFCF'
		}
	}
}
var SocketClient = function() {

	var socket = null;

	var onAuthSuccessEvent = new CustEvent();
	var onAuthFailureEvent = new CustEvent();
	var onConnectEvent = new CustEvent();
	var onDisconnectEvent = new CustEvent();
	var onReconnectEvent = new CustEvent();
	var onMessageEvent = new CustEvent();

	function createPacket(timestamp, type, format, label, parameters) {

		var newPacket = {}

		newPacket.timestamp = timestamp 
			? ( new Date() ).valueOf() 
			: null;

		if(!type) 
			throw new Error('Uncaught Icp Error: type is not defined');
		else
			newPacket.type = type;

		newPacket.format = format || 'text';
		newPacket.label = label || null;
		newPacket.parameters = parameters;

		return newPacket;

	}

	return {
		isConnected: function(success, failure) {
			setTimeout(function() {

				if(socket && socket.connected)
					success();
				else 
					failure();

			}, 0);
		},
		transmitPacket: function(packet, onTransmitted) {
			socket.emit('icp', packet, onTransmitted);
		},
		establishConnection: function(packet) {

			if(socket && socket.connected) 
				return socket.emit('authentication', packet);

			socket = io.connect('188.166.160.74:3000');

			this.session = socket.session = socket.session || {};


			socket.on('connect', function() {
				socket.emit('authentication', packet);
				onConnectEvent.emit();
			});

			socket.on('authenticated', function(packet) {
				onAuthSuccessEvent.emit(packet);
			});

			socket.on('unauthorized', function(packet) {
				onAuthFailureEvent.emit(packet);
			});

			socket.on('disconnect', function() {
				onDisconnectEvent.emit();
			});

			socket.on('reconnect', function() {
				onReconnectEvent.emit();
			});

			socket.on('icp', function(packet) {
				onMessageEvent.emit(packet);
			});

		},
		createRequest: function(label, parameters) {
			return createPacket(true, 'request', 'text', label, parameters);
		},
		disconnect: function() {

			if(socket && socket.connected)
				socket.disconnect();

		},
		onAuthSuccess: {
			addListener: onAuthSuccessEvent.addListener,
			removeListener: onAuthSuccessEvent.removeListener,
			removeAllListenerse: onAuthSuccessEvent.removeAllListenerse
		},
		onAuthFailure: {
			addListener: onAuthFailureEvent.addListener,
			removeListener: onAuthFailureEvent.removeListener,
			removeAllListenerse: onAuthFailureEvent.removeAllListenerse
		},
		onConnect: {
			addListener: onConnectEvent.addListener,
			removeListener: onConnectEvent.removeListener,
			removeAllListenerse: onConnectEvent.removeAllListenerse
		},
		onDisconnect: {
			addListener: onDisconnectEvent.addListener,
			removeListener: onDisconnectEvent.removeListener,
			removeAllListenerse: onDisconnectEvent.removeAllListenerse
		},
		onReconnect: {
			addListener: onReconnectEvent.addListener,
			removeListener: onReconnectEvent.removeListener,
			removeAllListenerse: onReconnectEvent.removeAllListenerse
		},
		onMessage: {
			addListener: onMessageEvent.addListener,
			removeListener: onMessageEvent.removeListener,
			removeAllListenerse: onMessageEvent.removeAllListenerse
		}

	}

}
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
						var messageLog	=	packet.parameters.messageLog;

						sc.transmitPacket(sc.createRequest('users', {}));

						if(motd)
							msg = msg + ' MOTD: ' + motd;

						sh.out.printHighlight(msg, sh.out.type.SYSTEM);

						for (var k = messageLog.length - 1; k >= 0; k--) {

							var content	=	messageLog[k].content;
							var date	=	new Date(messageLog[k].timestamp).format("h:MM:ss TT", new Date());
							var alias	=	messageLog[k].alias;

							msg = '[' + date + ']:' + '<' + alias + '>' + ' ' + content;
							sh.out.printLine(msg, sh.out.type.DEFAULT);

						}

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

					if(!sc.session.room) 
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

							shell.out.printEmptyLine();
							sh.out.printLine('You have been removed from room "' + name + '".', sh.out.type.WARNING);
							shell.out.printEmptyLine();
						}

					} else if(packet.type === 'broadcast') {

						if(name === sc.session.room) {

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
$(window).ready(function() {

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
		socketClient.establishConnection(socketClient.createRequest('login', event.data));
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
		shell.out.printHighlight('Please note that this is, only a prototype and bugs may occur!', shell.out.type.WARNING);
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