function animateCSS(elementSelec, animation, afterAnimate) {

	var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

	$(elementSelec)
		.addClass('animated')
		.addClass(animation)
		.one(animationEnd, function() {

			$(this)
				.removeClass('animated')
				.removeClass(animation);

				if(afterAnimate) 
					afterAnimate(this);

		});

}

function CustEvent() {

	var listenerArray = [];

	return {
		addListener: function(listener) {
			listenerArray.push(listener);
		},
		removeListener: function(listener) {
			for(var i=0; i<listenerArray.length; i++) {
				
				if(listener === listenerArray[i]) 
					listenerArray.splice(i,1);
				break;

			}
		},
		removeAllListeners: function() {
			listenerArray.splice(0, listenerArray.length);
		},
		emit: function(event) {
			if(listenerArray.length > 0)
				for(var i=0; i<listenerArray.length; i++) 
					listenerArray[i](event);
		}
	}

}

function InputVault(limit) {
 
	var recordArray = [];
	var index = null;

	return {

		addRecord: function (record) { 
			
			recordArray.push(record); 
			index = recordArray.length;
			
			if(recordArray.length > limit) {
				recordArray = recordArray.slice(1,limit + 1);
			}

		},
		getRecord: function(direction) {

			index = direction? --index : ++index;

			if(recordArray.length === 0 ) 
				return '';

			if(index < 0) 
				index = recordArray.length - 1;

			if(index > recordArray.length - 1) 
				index = 0;

			return recordArray[index];

		}

	}

}