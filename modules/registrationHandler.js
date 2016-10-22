var models = require('./models');

module.exports.newUser = function (username, password, alias, callback) {

	if(!username) 
		return callback('Username required');
	if(!password)
		return callback('Password required');
	if(!alias)
		return callback('Alias required');


	models.User.findOne({ $or:[ { 'username': username }, {'alias': alias } ] }, function(err, user) {

		if(err) 
			return callback('Fatal error');

		if(user) {
			
			if(user.username === username)
				return callback('Username alerady exists');
			
			if(user.alias === alias)
				return callback('Alias is already taken');
			
		} else {

			var newUser = new models.User({

				'username':	username,
				'password':	password,
				'alias':	alias

			});

			newUser.save(function(err) {

				if(err) 
					throw new Error('Fatal error');

				return callback('Registration complete', true);

			});
		}

	});
}