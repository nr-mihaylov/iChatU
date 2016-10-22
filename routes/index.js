var express				= require('express');
var router				= express.Router();
var regHandler			= require('../modules/registrationHandler');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'iChatU' });
});

router.post('/register', function(req, res, next) {

	try {

		var param = req.body;

		regHandler.newUser(param.username, param.password, param.alias, function(result, flag) {

			if(flag)
				res.json({ success: true });
			else 
				res.json({ error: result });
			
		});

	} catch(err) {
		res.json({ error: 'Unexpected error' });
	}

});

module.exports = router;
