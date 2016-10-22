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

	return {
	
		switch: function (target, exitAnimation, enterAnimation) {

			animateCSS(currentItem, exitAnimation, function(elements) {
				
				$(elements)
					.removeClass(opts.visibleSelec)
					.addClass(opts.hiddenSelec);

				$(target)
					.removeClass(opts.hiddenSelec)
					.addClass(opts.visibleSelec);

				animateCSS(target, enterAnimation, function(elements) {
					currentItem = $(target);
				});
			});
		}

	}
}

// var sectionSwitch = new SectionSwitch("#action", {
// 	itemSelec:			'section'
// });