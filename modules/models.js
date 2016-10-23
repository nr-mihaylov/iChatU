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

var User	= mongoose.model('User', userSchema);
var Room	= mongoose.model('Room', roomSchema);

module.exports = {
	User:		User,
	Room:		Room
}