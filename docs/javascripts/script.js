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

$(window).on('load', function() {

	var logoSelec = '.logo';
	var logoTextSelec = '.logo__text';

	var logo = new ichatLogo(logoSelec);

	var logoBlink = new BlinkCursor(logoTextSelec);
	logoBlink.start();

});