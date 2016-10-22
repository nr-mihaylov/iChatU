var models = require('./models');

/**
 * Room handler
 */

var roomCollection = {};

function init() {

	models.Room.find({}, function(err, rooms) {

		if(err) 
			throw new Error('Fatal error');

		rooms.forEach(function(element, index, array) {
			roomCollection[element.name] = element;
			roomCollection[element.name].users = {};
		});

	});

}

function retrieveRoom(roomName) {
	var room = roomCollection[roomName];
	if(room) 
		return room;
	else 
		return false;
}

function newRoom(name, password, motd, admin, callback) {

	var newRoom = {
		'name':		name,
		'password':	password,
		'motd':		motd,
		'admin':	admin,
		'date':		new Date()
	}	

	var room = new models.Room(newRoom);
	room.save(function(err) {

		if(err) 
			throw new Error('Fatal error');

		newRoom.users = {};
		roomCollection[newRoom.name] = newRoom;

		callback();

	});

}

function removeRoom(roomName, callback) {

	models.Room.findOneAndRemove({ 'name': roomName }, function(err, room) {

		if(err) 
			throw new Error('Fatal error');

		delete roomCollection[room.name];

		callback(room);

	});
}

function modifyRoom(roomName, password, motd, callback) {

	var update = {};
	if(password) 
		update.password = password;
	if(motd) 
		update.motd = motd;

	models.Room.findOneAndUpdate({ 'name': roomName }, { $set: update }, { new: true }, function(err, room) {

		if(err) 
			throw new Error('Fatal error');

		var item = roomCollection[room.name];
		
		if(room.password) 
			item.password = room.password;
		if(room.motd) 
			item.motd = room.motd;

		callback(room);

	});

}

function getRoomList() {

	var nameList = [];

	for(var name in roomCollection) 
		nameList.push(name);
	return nameList;

}

module.exports = {
	retrieveRoom: retrieveRoom,
	newRoom: newRoom,
	removeRoom: removeRoom,
	modifyRoom: modifyRoom,
	getRoomList: getRoomList,
	init: init
}