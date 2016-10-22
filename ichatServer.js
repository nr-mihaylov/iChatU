module.exports = function(socket, io) {

	socket.respondToRequest = function(event, data) {
		socket.emit(event, data);
	}

	socket.broadcastToRoom = function(room, event, data) {
		socket.broadcast.to(room).emit(event, data);
	}

	socket.getAllInRoom = function(roomName, callback) {

		var socketList = io.sockets.adapter.rooms[roomName];
		var users = [];

		if(!socketList)
			return callback(null);


		for (var id in socketList.sockets) 
			users.push(io.sockets.adapter.nsp.connected[id]);

		return 
			callback(users);
	}

	socket.broadcastToGeneral = function(event, data) {

		var socketList = io.sockets.adapter;

	}

	socket.broadcastToOne = function(id, event, data) {
		socket.broadcast.to(id).emit(event, data);
	}

	socket.broadcastToAll = function(event, data) {
		socket.broadcast.emit(event, data);
	}

}