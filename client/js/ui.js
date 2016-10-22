function ichatLogo(selec) {

	var logoImgSelector		=	selec + ' .logo__img';
	var logoTextSelector	=	selec + ' .logo__text';

	/**
	* Alter the font size of the logo text so that it is half of the 
	* size of the logo itself. We use javascript since there is no 
	* good solution with css alone. Since the logo image is the same 
	* size as the entire logo, it is used as a reference.
	*/

	function adjustLogoText() {
		$(logoTextSelector).css('font-size', $(logoImgSelector).height()/2);
	}

	adjustLogoText();
	$(window).resize(adjustLogoText);

}


//========================================================================================


/**
* Add a blinking underscore to the end of the element content 
* specified by the selector parameter.
*
* @param {string} selector - A selector specifying the element(s), that 
* must be altered.
*/

function BlinkCursor(selec) {

	id = null;

	return {
		start: function() {

			var element = $(selec);

			if(element)
				id = setInterval(function() {

					var text = element.text();
					var suffix = text.slice(text.length - 1, text.length);

					if(suffix === '_') 
						element.text(text.slice(0, text.length - 1));
					else
						element.text(element.text() + '_');


				}, 600);

		},
		stop: function () {
			if(id) clearInterval(id);
		}
	}
}


//========================================================================================


function ichatuFold(selec) {

	var onCollapseEndEvent = new CustEvent();
	var onExpandEndEvent = new CustEvent();

	return {
		collapse: function(animation) {
			
			animateCSS(selec, animation, function(elements) {
				$(elements).hide();
				onCollapseEndEvent.emit();
			});

		},
		expand: function(animation) {
			
			$(selec).show();

			animateCSS(selec, animation, function(elements) {
				onExpandEndEvent.emit();
			});

		},
		onCollapseEnd: {
			addListener: onCollapseEndEvent.addListener,
			removeListener: onCollapseEndEvent.removeListener,
			removeAllListenerse: onCollapseEndEvent.removeAllListenerse
		},
		onExpandEnd: {
			addListener: onExpandEndEvent.addListener,
			removeListener: onExpandEndEvent.removeListener,
			removeAllListenerse: onExpandEndEvent.removeAllListenerse
		}
	}
}


//========================================================================================


/**
* The SectionSwitch component is responsible for changing between 
* html element groups. Objects of this type use the CSS animations.
* 
* @param {string} container - a selector specifying the container element(s).
*
* @param {Object} opts - optional intilized object for a number of values, such 
* as the children element(s) of the container, that will be switched between.
*/

function SectionSwitch(container, opts) {

	if(!container) 
		throw new Error('ReferenceError: missing container argument');

	opts				=	opts				||	{};
	opts.itemSelec		=	opts.itemSelec		||	'>*';
	opts.visibleSelec	=	opts.visibleSelec	||	'switch--visible';
	opts.hiddenSelec	=	opts.hiddenSelec	||	'switch--hidden';

	var items = $(container + ' ' + opts.itemSelec);

	// Add missing classes & ids

	for(var i = 0; i<items.length; i++) {

		if($(items[i]).hasClass(opts.visibleSelec))
			var currentItem = items[i];
		else if(!$(items[i]).hasClass(opts.hiddenSelec))
			$(items[i]).addClass(opts.hiddenSelec);

		$(items[i]).attr('id', 'switch'+i);

	}

	var animationFlag = false;

	return {
	
		switch: function (target, exitAnimation, enterAnimation) {

			if(!animationFlag) {

				animationFlag = true;

				animateCSS(currentItem, exitAnimation, function(elements) {

					$(elements)
						.removeClass(opts.visibleSelec)
						.addClass(opts.hiddenSelec);

					$(target)
						.removeClass(opts.hiddenSelec)
						.addClass(opts.visibleSelec);

					animateCSS(target, enterAnimation, function(elements) {
						currentItem = $(target);
						animationFlag = false;
					});

				});

			}

		}

	}
}


//========================================================================================


function ichatuForm(selec, opts) {

	opts					=	opts					||	{};
	opts.adjustBreakpoint	=	opts.adjustBreakpoint	||	768;
	opts.alternateModSelec	=	opts.alternateModSelec	||	'form--alternate';

	var fieldSelec = selec + ' .form__field';
	var validationSelec = selec + ' .form__validation';
	var submitSelec = selec + ' .form__submit';
	var cancelSelec = selec + ' .form__cancel';
	
	var submitEvent = new CustEvent();
	var cancelEvent = new CustEvent();

	var fields = $(fieldSelec);

	function extractFormData(fieldsSelec) {

		var data = {};

		for(var i=0; i<fields.length; i++) 
			data[$(fields[i]).attr('name')] = $(fields[i]).val();

		return data;

	}

	$(selec).keypress(function(event) {

		if(event.keyCode === 13) 
			submitEvent.emit({ data: extractFormData($(fieldSelec)) });	

	});

	$(submitSelec).click(function() {
		submitEvent.emit({ data: extractFormData($(fieldSelec)) });
	});

	$(cancelSelec).click(function() {
		cancelEvent.emit();
	});

	/**
	* The minimum screen size for the application is 3.5 inches or 
	* equivalent to the screen size of the iphone 4. On such a device
	* in landscape mode, forms with three fields are too big and cause 
	* the buttons to partially overflow outside the screen, hence the 
	* usability is reduced. To counter this the form actionbar is positioned 
	* on the right side of the form fields instead of below. This is limited 
	* to small screens only. Adding the form--alternate class overrides
	* some of the css styles in order to apply the layout changes.
	*/

	function adjustLayout() {

		var w = $(window).width();
		var h = $(window).height();

		if(w < opts.adjustBreakpoint && h < opts.adjustBreakpoint && w > h) 
			$(selec).addClass(opts.alternateModSelec);
		else 
			$(selec).removeClass(opts.alternateModSelec);

	}

	adjustLayout();
	$(window).resize(adjustLayout);

	return {
		setValidationText: function(text) {
			$(validationSelec).text(text);
		},
		onSubmit: {
			addListener: submitEvent.addListener,
			removeListener: submitEvent.removeListener,
			removeAllListenerse: submitEvent.removeAllListenerse
		},
		onCancel: {
			addListener: cancelEvent.addListener,
			removeListener: cancelEvent.removeListener,
			removeAllListenerse: cancelEvent.removeAllListenerse
		}
	}

}


//========================================================================================


function ichatuStatusbar(selec) {

	var statusSelec = $(selec + " #status_beat");
	var infoSelec = $(selec + " #info_btn img");

	var onCollapseEndEvent = new CustEvent();
	var onExpandEndEvent = new CustEvent();

	return {
		statusBeat: $(statusSelec),
		infoBtn: $(infoSelec),
		collapse: function(animation) {
			
			animateCSS(selec, animation, function(elements) {
				$(elements).hide();
				onCollapseEndEvent.emit();
			});

		},
		expand: function(animation) {
			
			$(selec).show();
			
			animateCSS(selec, animation, function(elements) {
				onExpandEndEvent.emit();
			});

		},
		statusOn: function() {
			
			$(statusSelec)
				.removeClass('statusbar__item--off')
				.addClass('statusbar__item--on');

		},
		statusOff: function() {

			$(statusSelec)
				.removeClass('statusbar__item--on')
				.addClass('statusbar__item--off');

		},
		onCollapseEnd: {
			addListener: onCollapseEndEvent.addListener,
			removeListener: onCollapseEndEvent.removeListener,
			removeAllListenerse: onCollapseEndEvent.removeAllListenerse
		},
		onExpandEnd: {
			addListener: onExpandEndEvent.addListener,
			removeListener: onExpandEndEvent.removeListener,
			removeAllListenerse: onExpandEndEvent.removeAllListenerse
		}
	}

}


//========================================================================================


function ichatuSidebar(selec, opts) {

	opts					=	opts					||	{};
	opts.adjustBreakpoint	=	opts.adjustBreakpoint	||	1200;

	var headerSelec = selec + ' .sidebar__header';
	var bodySelec = selec + ' .sidebar__body';

	var onCollapseEndEvent = new CustEvent();
	var onExpandEndEvent = new CustEvent();

	var listType = 0;

	var displayFlag = false;

	$(window).resize(function() {

		if($(window).width() > opts.adjustBreakpoint) 
			$(selec).show();
		else if(!displayFlag)
			$(selec).hide();

	});

	return {

		collapse: function(animation) {
			
			displayFlag = false;

			animateCSS(selec, animation, function(elements) {
				$(elements).hide();
				onCollapseEndEvent.emit();
			});

		},
		expand: function(animation) {
			
			displayFlag = true;

			$(selec).show();
			animateCSS(selec, animation, function(elements) {
				onExpandEndEvent.emit();
			});

		},
		toggle: function(expandAnimation, collapseAnimation) {

			if($(selec).is(':hidden')) 
				this.expand(expandAnimation);
			else 
				this.collapse(collapseAnimation);

		},
		list: {
			setTitle: function(title) {
				$(headerSelec).text(title);
			},
			addItemToList: function(item) {
				
				var item = $('<div>'+ item +'</div>')
					.addClass('default')
					.appendTo(bodySelec);

				animateCSS(item, 'fadeIn');

			},
			removeListItem: function(item) {

				$(bodySelec).find('div').each(function(index, element) {
					
					element = $(element);

					if(element.text() === item)
						animateCSS(element, 'fadeOut', function(elements) {
							elements.remove();
						}); 
						
				});
			},
			addItemsToList: function(items) {
				
				for(var i=0; i<items.length; i++) 
					this.addItemToList(items[i]);

			},
			emptyList: function() {
				$(bodySelec).empty();
			},
			listType: listType
		},
		onCollapseEnd: {
			addListener: onCollapseEndEvent.addListener,
			removeListener: onCollapseEndEvent.removeListener,
			removeAllListenerse: onCollapseEndEvent.removeAllListenerse
		},
		onExpandEnd: {
			addListener: onExpandEndEvent.addListener,
			removeListener: onExpandEndEvent.removeListener,
			removeAllListenerse: onExpandEndEvent.removeAllListenerse
		}

	}

}