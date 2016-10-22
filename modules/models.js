var mongoose = require('mongoose');

/**
 * MongoDB logic
 */

var userSchema = mongoose.Schema({

	username: String,
	password: String,
	alias: String

});

var roomSchema = mongoose.Schema({

	name: String,
	password: String,
	motd: String,
	admin: String,
	date: Date

});

var messageSchema = mongoose.Schema({

	content:	String,
	roomid: 	String, 
	room:		String, 
	alias:		String,
	timestamp:	Number

});

var User	= mongoose.model('User', userSchema);
var Room	= mongoose.model('Room', roomSchema);
var Message	= mongoose.model('Message', messageSchema);

module.exports = {
	User:		User,
	Room:		Room,
	Message:	Message
}