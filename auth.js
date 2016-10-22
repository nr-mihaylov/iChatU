var models = require('./models');
var icp = require('./icp');

function init(socket, packet, callback) {

	// Don't do in production. Needs proper token based auth.

	var username = packet.parameters.username;
	var password = packet.parameters.password;

	if(!username)
			return callback(null, false, icp.createResponse('unauthorized', { 
				'error': 'Username required' 
			}));

	if(!password)
			return callback(null, false, icp.createResponse('unauthorized', { 
				'error': 'Password required' 
			}));		

	models.User.findOne({ 'username': username }, function(err, user) {

		if(err) 
			return callback(icp.createResponse('ioerror', { 'error': err }));

		if(user !== null) {
			if(user.password === password) {

				var session = {
					alias: user.alias,
					username: user.username,
					room: undefined
				}

				socket.session = session;

				return callback(null, true, icp.createResponse('authenticated', {
					'alias': user.alias,
					'server': 'iChat ONE',
					'welcome': 'Welcome to iChat ONE!'
				}));

			} else {

				return callback(null, false, icp.createResponse('unauthorized', { 
					'error': 'Incorrect password' 
				}));

			}
		
		} else {

			return callback(null, false, icp.createResponse('unauthorized', { 
				'error': 'Incorrect username' 
			}));

		}

	});

}

module.exports = {
	init: init
}