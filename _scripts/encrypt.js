function getHash(str) {
	var hash = 0, i, chr;
	if (str.length === 0) return hash;
	for (i = 0; i < str.length; i++) {
		chr   = str.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return hash;
};

function Encrypt() {

	this.protect = function() {

		var elems = [];

		var create = function(promise) {

			// create input text and show
			var input = document.createElement("input");
			input.type = "text";
			input.className = "encrypt";
			input.setAttribute( "style", "display: none; font-family: " + "Garamond" );
			$( input ).css("position", "absolute");
			$( input ).css("text-align", "center");
			$( input ).css("margin", 0); // removes strange offsets
			$( input ).css("font-size", 18);

			elems.push(input);
			document.body.appendChild(input);

			// layout
			var tw = Math.max($(window).width()/5, 200);
			var th = 22;
			var tx = $(window).width()/2-tw/2;
			var ty = $(window).height()/5*2.4-th/2;
			setTxtPosDim( $(input), tx, ty, tw, th );

			$( input ).on('keyup', function (e) {
			    if (e.keyCode == 13) {
			    	if (getHash(input.value) == -934352947) {
			    		promise.resolve();
			    	} else {
			    		$( input ).effect( "shake", { distance: 10, times: 2 } );
			    	}
			    }
			});

			var text = getTextElement("", "Password", "", "Didot_i", "#888888", [], "none");
			elems.push(text);
			$( text ).css("font-size", 18);
			setTxtPosDim( $(text), $(window).width()/2-$(text).width()/2, ty-$(text).height()*1.2 );

			$(input).fadeIn(200);
			$(text).fadeIn(200);
			setTimeout( function() {
				$(input).focus()
			}, 200);
		};

		var destroy = function(promise) {

			// fade out all elements
			$( elems ).each( function(index, element) {
				$( element ).fadeOut( this.fadeOutMs );
			});

			// delete all elements
			setTimeout( function() { 
				$( elems ).each( function(index, element) {
					$( element ).remove(); 
				});
				promise.resolve();
			}, 200 );
			elems = [];
		};

		return consecCall( [ create, destroy ] );
	}
}