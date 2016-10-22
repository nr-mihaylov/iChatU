var models = require('./models');

function newMessage(content, roomid, room, alias, timestamp) {

	var newMessage =  new models.Message({
		'content':		content,
		'roomid':		roomid,
		'room':			room,
		'alias':		alias,
		'timestamp':	timestamp
	});

	newMessage.save();

}

function getMessages(roomid, callback) {

	models.Message.find(
		{ 
			'roomid': roomid 
		}, 
		null, 
		{ 
			sort: { timestamp: -1 }, 
			limit: 15 
		}, 
		function(err, messages) {
			callback(messages);
		}
	);

}

module.exports = {
	newMessage: newMessage,
	getMessages: getMessages
}