function Shell(inputSelector, outputSelector) {

	var input = $(inputSelector);
	var inputVault = new InputVault(100);
	var onSubmitEvent = new CustEvent();

	$(outputSelector).perfectScrollbar({
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

	return {
		in: {
			onSubmit: onSubmitEvent.addListener,
			unbindSubmit: onSubmitEvent.removeListener,
			unbindAllSubmit: onSubmitEvent.removeAllListeners
		},
		out: ( new TextFormatter(outputSelector) )
	}
}

var TextFormatter = function(selec, opts) {

	opts = opts || {};

	const SYMBOL_TOP_BORDER		=	opts.SYMBOL_TOP_BORDER || '=';
	const SYMBOL_SIDE_BORDER	=	opts.SYMBOL_SIDE_BORDER || '|';
	const PADDING_TOP			=	opts.PADDING_TOP || 1;
	const PADDING_SIDE			=	opts.PADDING_SIDE || 1;
	const SAMPLE_SELECTOR		=	opts.SAMPLE_SELECTOR || '.shell__sample';

	var sampleW					=	$(SAMPLE_SELECTOR).width();
	var sampleH					=	$(SAMPLE_SELECTOR).height();
	var container				=	$(selec);
	var containerWidth			=	container.height() < container.width() 
										? container.height() 
										: container.width();

	var lineMaxSymbols			=	Math.floor(containerWidth/sampleW);
	var contentMaxSymbols		=	lineMaxSymbols - 2 * (SYMBOL_SIDE_BORDER.length + PADDING_SIDE);

	function generateRaw(content) {

		var item = $('<div></div>')
			.html(content)
			.appendTo(container);

		animateCSS(item, 'fadeIn');

	} 

	function generateLine(content, type) {

		var item =  $('<div></div>').html(
			
			$('<pre></pre>')
				.addClass('shell__output-line')
				.text(content)
				
			)
		.css('color', type)
		.appendTo(container);

		animateCSS(item, 'fadeIn');

	}

	function generateUniform(symbol, length, type) {

		var item = $('<div><pre>'+ Array(length + 1).join(symbol) + '</pre></div>')
		.css('color', type)
		.appendTo(container);

		animateCSS(item, 'fadeIn');

	}

	function generateEmptyRow(length, type) {

		var item = $(
			'<div><pre>' + 
			SYMBOL_SIDE_BORDER + 
			Array(PADDING_SIDE + 1).join(' ') + 
			Array(length - ( (PADDING_SIDE * 2) + 1) ).join(' ') + 
			Array(PADDING_SIDE + 1).join(' ') + 
			SYMBOL_SIDE_BORDER + 
			'</pre></div>'
		)
		.css('color', type)
		.appendTo(container);

		animateCSS(item, 'fadeIn');

	}

	function generateRow(content, type) {

		var whiteSpace = contentMaxSymbols - content.length;

		var item = $(
			'<div><pre>' + 
			SYMBOL_SIDE_BORDER + 
			Array(PADDING_SIDE + 1).join(' ') + 
			content + 
			Array(PADDING_SIDE + whiteSpace + 1).join(' ') + 
			SYMBOL_SIDE_BORDER + 
			'</pre></div>'
		)
		.css('color', type)
		.appendTo(container);

		animateCSS(item, 'fadeIn');

	}

	function generateContent(content, type) {

		if(content.length > contentMaxSymbols) {

			var current = content.slice(0, contentMaxSymbols),
			next = content.slice(contentMaxSymbols, contentMaxSymbols.length);

			generateRow(current, type);
			generateContent(next, type);

		} else {
			generateRow(content, type);
		}

	}

	function scroll() {
		container.scrollTop(container.prop('scrollHeight'));
		container.perfectScrollbar('update');
	}

	return {

		printRaw: function(content, type) {
			generateRaw(content, type);
			scroll();
		},
		printLine: function(content, type) {
			generateLine(content, type);
			scroll();
		},
		printLines: function(content, type) {
			for(var i = 0; i<content.length; i++)
				generateLine(content[i], type);

			scroll();
		},
		printEmptyLine: function() {
			generateUniform(' ', lineMaxSymbols);
			scroll();
		},
		printHighlight: function(content, type) {
			generateUniform(' ', lineMaxSymbols, type);
			generateUniform(SYMBOL_TOP_BORDER, lineMaxSymbols, type);
			generateEmptyRow(lineMaxSymbols, type);
			generateContent(content, type);
			generateEmptyRow(lineMaxSymbols, type);
			generateUniform(SYMBOL_TOP_BORDER, lineMaxSymbols, type);
			generateUniform(' ', lineMaxSymbols, type);
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