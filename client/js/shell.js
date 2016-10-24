function Shell(inputSelector, outputSelector) {

	var input = $(inputSelector);
	var output = $(outputSelector);
	var inputVault = new InputVault(100);
	var onSubmitEvent = new CustEvent();

	output.perfectScrollbar({
		wheelSpeed: 1,
		suppressScrollX: true
	}); 

	function setContent(content) {
		input.val(content);

		setTimeout(function() {
			input[0].selectionStart = input[0].selectionEnd = content.length;
		});
	}

	function getContent(input) {
		return input.val();
	}

	function clearInput(input) {
		input.val('');
	}

	input.data('flag', true);
	input.keypress(function(event) {

		if(event.which === 13) {
			
			$(this).data('flag', false);
			$(this).attr('rows', 1);

			var content = getContent(input);

			inputVault.addRecord(content);
			onSubmitEvent.emit(content);

		} else 
			$(this).data('flag', true);

	});

	input.on('input', function() {

		if($(this).data('flag')) {

			$(this).attr('rows', 1);
			$(this).attr('rows', Math.ceil(($(this).prop('scrollHeight') - $(this).outerHeight()) / $(this).height()) + 1);

		} else {
			$(this).data('flag', true);
			clearInput(input);
		}

	});

	input.keydown(function(eventx) {

		var key = event.keyCode;

		if(key === 38)
			setContent(inputVault.getRecord(true));

		if(key === 40)
			setContent(inputVault.getRecord(false));

	});

	function generateRaw(content) {

		var item = $('<div></div>')
			.html(content)
			.appendTo(output);

		animateCSS(item, 'fadeIn');

	} 

	function generateLine(content, type) {

		var item =  $('<div></div>').html(
			
			$('<pre></pre>')
				.addClass('shell__output-line')
				.text(content)
				
			)
		.css('color', type)
		.appendTo(output);

		animateCSS(item, 'fadeIn');

	}

	function scroll() {
		output.scrollTop(output.prop('scrollHeight'));
		output.perfectScrollbar('update');
	}

	return {
		in: {
			onSubmit: onSubmitEvent.addListener,
			unbindSubmit: onSubmitEvent.removeListener,
			unbindAllSubmit: onSubmitEvent.removeAllListeners
		},
		out: {
			printRaw: function(content) {
				generateRaw(content);
				scroll();
			},
			printLine: function(content, type) {

				switch(type) {

					case this.type.SYSTEM:
						content = '[INFO]: ' + content;
					break;

					case this.type.SUCCESS:
						content = '[SUCCESS]: ' + content;
					break;

					case this.type.WARNING:
						content = '[WARNING]: ' + content;
					break;

					case this.type.ERROR:
						content = '[ERROR]: ' + content;
					break;

				}

				generateLine(content, type);
				scroll();
			},
			printLines: function(content, type) {
				for(var i = 0; i<content.length; i++)
					generateLine(content[i], type);

				scroll();
			},
			type: {
				DEFAULT:	'#EEEEEE',
				SUCCESS:	'#5CFF73',
				WARNING:	'#FF8143',
				ERROR:		'#FF5750',
				SYSTEM:		'#42FFCF'
			}
		}
	}
}