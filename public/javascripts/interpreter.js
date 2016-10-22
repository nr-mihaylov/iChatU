/**
 * Handle input submission from the application console
 *
 * @param {String} element - the selector for the input field
 */

function Interpreter(opts) {

	var COMMAND_PREFIX = opts.COMMAND_PREFIX || '/';
	var ARGUMENT_PREFIX = opts.ARGUMENT_PREFIX || '--';

	function isCommand(command, success, failure) {

		setTimeout(function() {
			if((command = command.split(' ')[0]).substring(0, COMMAND_PREFIX.length) === COMMAND_PREFIX) 
				success(command);
			else 
				failure(command);
		}, 0);

	} 

	function isValidCommand(command, validation, success, failure) {

		setTimeout(function() {
			var flag = false;

			for(var validCommand in validation) 
				if(COMMAND_PREFIX + validCommand === command) {
					success(validation[validCommand]);
					flag = true;
					break;
				}


			if(!flag) 
				failure();
		}, 0);

	}

	function hasValidArgs(args, validation) {

		validation = $.extend(true, {}, validation);
		var result = true;

		if(!(args.length > 0 && validation.length === 0)) {

			for(var i = 0; i<args.length; i++) {

				var argument = args[i];
				var value = args[++i];

				result = 
				isArgument(argument) ? 
					isValidArgument(argument, validation) ?
						(value !== undefined) ?
							(!isArgument(value)) ?
									true
								: argument + ' value is missing.'
							: argument + ' value is missing.'
						: argument + ' is not a valid argument.' 
					: argument + ' is not an argument.';

				if(result !== true) return result;

			}

			for(var item in validation) 
				if(validation[item].required && validation[item].found === undefined)
					return validation[item].name + ' argument is missing.';

			return result;

		} else 
			return 'No arguments expected.';
	}

	function isArgument(arg) {
		return arg.substring(0, ARGUMENT_PREFIX.length) === ARGUMENT_PREFIX;
	}

	function isValidArgument(arg, validation) {

		for(var rule in validation)
			if(ARGUMENT_PREFIX + validation[rule].name === arg) {
				if(validation[rule].required) 
					validation[rule].found = true;
				return true;
			} 

	}

	function prepareCmd(str, callback) {

		setTimeout(function() {

			var result = [];
			var flag = false;
			var arg = '';

			for(var i = 0; i<str.length; i++) {

				if(str.charAt(i) === ' ') {
					
					if(flag) 
						arg += str.charAt(i);
					 else {
						if(arg.length > 0) 
							result.push(arg);
						arg = '';
					}

				} else if( (str.charAt(i) === '"') && (str.charAt(i-1) !== '\\' )) {

					if(flag) {
						flag = !flag;
						if(arg.length > 0) 
							result.push(arg);
						arg = '';
					} else 
						flag = !flag;

				} else if( (str.charAt(i) === '"') && (str.charAt(i-1) === '\\' )) {

					arg = arg.slice(0, arg.length - 1);
					arg += str.charAt(i);

				} else {
					
					arg += str.charAt(i);
				
				}

			}

			if(arg.length > 0) 
				result.push(arg);

			callback(result);

		}, 0)

	}

	return {
		interpret: function(input, commandList, success, error) {

			isCommand(input, function(command) {
				prepareCmd(input, function(args) {
					isValidCommand(command, commandList, function(validation) {

						args.splice(0,1);
						var result;

						if((result = hasValidArgs(args, validation.validArgs)) === true) {

							var argsObj = {};

							for(var i=0; i<args.length; i++) 
								argsObj[args[i].slice(ARGUMENT_PREFIX.length)] = args[++i];

							success(command.slice(COMMAND_PREFIX.length), argsObj, validation.isOnline);

						} else 
							error(result);

					}, function() {
						error(command + ' is not a valid command.');
					});

				});

			}, function() {
				success('message', { content: input }, true);
			});

		}

	}

}