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

			socket = io.connect('localhost:3000');

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