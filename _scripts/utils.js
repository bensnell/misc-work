// Utility functions

function stopScrollRestoration() {

	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function gaussianRandom(nVals) {

	var sum = 0;
	for (var i = 0; i < nVals; i++) {
		sum += Math.random();
	}
	return sum / nVals;
}

function clamp(val, min, max) {
	var mi = min;
	var ma = max;
	if (mi > ma) {
		var tmp = mi;
		mi = ma;
		ma = tmp;
	}
	return Math.max(Math.min(val, ma), mi);
}

function safePower(val, power) {

	var mult = (val < 0) ? -1 : 1;
	return mult * Math.pow(Math.abs(val), power);
}

function map(val, minIn, maxIn, minOut, maxOut, bClamp, power=1) {

	var tmp = (val-minIn)/(maxIn-minIn);
	tmp = safePower(tmp, power);
	tmp = tmp * (maxOut-minOut) + minOut;
	if (bClamp) {
		tmp = clamp(tmp, minOut, maxOut);
	}
	return tmp;
}

function gaussian(value, mean, stdev, bScaled) {
    
    var out = (1.0/(stdev*Math.sqrt(2.0*3.141592)))*Math.exp(-((value-mean)*(value-mean))/(2.0*stdev*stdev));
    if (bScaled) out /= gaussian(mean, mean, stdev, false);
    return out;
}

// 0 	-> 0
// 0.5 	-> 0.5
// 1 	-> 1

function logistic(value, center, intensity, scaleToRange) {
    
    center = clamp(center, 0, 1);
    var outValue = 1.0 / (1 + Math.exp(-intensity * (value - center)));
    if (scaleToRange) {
        outValue = map(outValue, logistic(0, center, intensity, false), logistic(1, center, intensity, false), 0, 1);
    }
    outValue = clamp(outValue, 0, 1);
    return outValue;
}


//              ________  	1
//            /
//           /
//  _ _ _ _ /				0
//          
//             ^ center
// left tail
function logisticSimple(value, mean, stdev, bLeftTail) {

	var intensity = 3.0/stdev * (bLeftTail ? -1 : 1);
	return 1.0 / (1 + Math.exp( intensity * (value-mean) - 4.5 ) );
}

function strip(str, chr) {

	out = str;
	while (out.length > 0 && out.slice(0, 1) == chr) {
		out = out.slice(1);
	}
	while (out.length > 0 && out.slice(-1) == chr) {
		out = out.slice(0, -1);
	}
	return out;
}

function rangeStep(start, end, step) {
	out = []
	for (var i = start; i <= end; i += step) out.push(i);
	return out;
};

function rangeVals(start, end, nVals) {
	out = []
	for (var i = 0; i < nVals; i += 1 ) out.push( map(i, 0, nVals-1, start, end, true) );
	return out;
};

function rect(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.col = null;

	this.getCopy = function() {
		var tmp = new rect();
		tmp.x = this.x;
		tmp.y = this.y;
		tmp.w = this.w;
		tmp.h = this.h;
		tmp.col = this.col;
		return tmp;
	}

	this.setFromImage = function(img) {
		this.x = $(img).offset().left;
		this.y = $(img).offset().top;
		this.w = $(img).attr("width");
		this.h = $(img).attr("height");
	}

	// get bottom
	this.b = function() {
		return this.y + this.h;
	};

	// get right
	this.r = function() {
		return this.x + this.w;
	};

	this.transform = function(dx, dy) {
		this.x += dx;
		this.y += dy;
	}

	// Check if intersects with other rectangle
	this.intersects = function(b) {
		var a = this;
		return !(a.r() < b.x || a.x > b.r() || a.b() < b.y || a.y > b.b());
	};

	// Check containment percentage along an axis
	// x axis = 0
	// x axis = 1
	// scope = {"total", "self"} // conditionality
	this.inx = function(b, type, axis, scope) {
		var a1 = (axis == 0) ? this.x : this.y;
		var a2 = (axis == 0) ? this.x+this.w : this.y+this.h;
		if (a1 > a2) {
			var tmp = a2;
			a2 = a1;
			a1 = tmp;
		}
		var b1 = (axis == 0) ? b.x : b.y;
		var b2 = (axis == 0) ? b.x+b.w : b.y+b.h;
		if (b1 > b2) {
			var tmp = b2;
			b2 = b1;
			b1 = tmp;
		}

		var range = 0;
		if (scope == "total") {
			range = Math.max(a2, b2) - Math.min(a1, b1);
		} else if (scope == "self") {
			range = a2 - a1;
		}
		if (type == "AandB") {

			var lo = Math.max(a1, b1);
			var hi = Math.min(a2, b2);
			return (hi-lo) / range;

		} else if (type == "AnotB") {

			var lo = Math.max(a1, b1);
			var hi = Math.min(a2, b2);
			return ((a2-a1) - (hi-lo)) / range;

		} else if (type == "BnotA") {

			// doesn't work for self
			var lo = Math.max(a1, b1);
			var hi = Math.min(a2, b2);
			return (scope == "self") ? 0 : ((b2-b1) - (hi-lo)) / range;
			
		} else if (type == "AorB") {

			// doesn't work for self
			return 1;

		} else if (type == "AxorB") {

			// doesn't work for self
			var lo = Math.max(a1, b1);
			var hi = Math.min(a2, b2);
			if (scope == "self") {
				// same as AnotB
				return ((a2-a1) - (hi-lo)) / range;
			} else {
				return 1 - (hi-lo) / range;
			}

		} else {
			return 1;
		}
	};

};

function emptyDict(_dict) {
	return Object.keys(_dict).length === 0;
}

function isArray(a){
	return Array.isArray(a);
}

// Log dragging to check if a touchend if a drag or a tap
var bDrag = false;
$( window ).on("touchstart", function(){ bDrag = false; });
$( window ).on("touchmove", function(){ bDrag = true; });

function onTap(element, url) {
	if (url != "") {
		$( element ).on("click", function() { 
			loadURL( url ); 
		});
		$( element ).on("touchend", function() { 
			if (!bDrag) loadURL( url ); 
			bDrag = false; 
		});
	}
}
function onTapFn(element, fn) {
	// Taps will prevent double events when there is a touchscreen
	var debounceTimeMs = 1000;
	if ( !element["taps"] ) element["taps"] = [];

	$( element ).on("click", function() {

		if ( element["taps"].length > 0) {
			var lastTap = element["taps"][element["taps"].length-1];
			if (lastTap[0] == "touch" && Math.abs(lastTap[1]-getTimeMs()) < debounceTimeMs) return;
		}

		element["taps"].push( ["click", getTimeMs()] );
		fn();
	});
	$( element ).on("touchend", function() { 

		if ( element["taps"].length > 0) {
			var lastTap = element["taps"][element["taps"].length-1];
			if (lastTap[0] == "click" && Math.abs(lastTap[1]-getTimeMs()) < debounceTimeMs) return;
		}

		if (!bDrag) {
			element["taps"].push( ["touch", getTimeMs()] );
			fn(); 
		}
		bDrag = false; 
	});
}

function getTimeMs() {
	return (new Date).getTime();
}

function elementExists(id) {
	return document.getElementById(id) != null;
}

function getTextElement(id, text, url, font, color, classes = [], cursorOnHover="") {
	var para = document.createElement( "P" );
	para.setAttribute( "id", id );
	para.setAttribute( "style", "display: none; font-family: " + font );

	// this won't allow links:
	// var _text = document.createTextNode( text );
	// para.appendChild(_text);

	// this will allow links:
	para.innerHTML = text;

	$.each(classes, function(index, element) { para.classList.add(element); });
	onTap( para, url );
	if (cursorOnHover != "") $( para ).css('cursor', cursorOnHover);
	if (url != "") $( para ).hover( function() { $( para ).css('cursor', ((cursorOnHover=="")?"pointer":cursorOnHover) ); });
	if (cursorOnHover == "none") $( para ).hover( function() { $( para ).css('cursor', "none"); });
	if (cursorOnHover == "default") $( para ).hover( function() { $( para ).css('cursor', "default"); });



	$( para ).css("position", "absolute");
	$( para ).css('color', (color=="" ? "#000000" : color) );
	$( para ).css("margin", 0); // removes strange offsets
	// document.body.style = "white-space: pre;"
	document.body.style = "white-space: pre-wrap;"
	// see: https://stackoverflow.com/questions/4413015/browser-compatible-word-wrap-and-whitespace-pre
	document.body.appendChild(para);
	return para;
}

function getImageElement(id, path, url, classes = [], bCursorOnHover = true) {
	var img = document.createElement("IMG");
    img.setAttribute("id", id);
    img.setAttribute("src-tmp", path);
    $.each(classes, function(index, element) { img.classList.add(element); });
    onTap( img, url );
	if (bCursorOnHover) $( img ).hover( function() { $( img ).css('cursor','pointer'); });
	$( img ).css("display", "none");
	$( img ).css("position", "absolute");
    document.body.appendChild(img);
    return img;
}

function getDivElement(id, url, classes = [], cursorType = "") {
	var div = document.createElement("div");
    div.setAttribute("id", id);
    $.each(classes, function(index, element) { div.classList.add(element); });
    onTap( div, url );
	if (cursorType != "") $( div ).hover( function() { $( div ).css('cursor',cursorType); });
	// $( div ).css("display", "none");
	$( div ).css("position", "absolute");
    document.body.appendChild(div);
    return div;
}

function getVimeoPath(vidID) {
	return "https://player.vimeo.com/video/" + vidID + "?color=ffffff&amp;title=0&amp;byline=0&amp;portrait=0";
}

function getYoutubePath(vidID) {
	return "https://www.youtube.com/embed/" + vidID + "?rel=0&modestbranding=1&color=white";
}

function getVideoPath(vidID, vidType) {
	if (vidType == "vimeo") return getVimeoPath(vidID);
	else if (vidType == "youtube") return getYoutubePath(vidID);
	return "";
}

function getVideoElement(id, vidID, vidType, dims, classes=[], bCursorOnHover=true) {

	var path = getVideoPath(vidID, vidType);
	return getiFrameElement(id, path, dims[0], dims[1], classes, bCursorOnHover);
}

// Video element
function getiFrameElement(id, url, width, height, classes=[], bCursorOnHover=true) {
	var vid = document.createElement("iframe");
	vid.setAttribute("id", id);
	vid.setAttribute("src-tmp", url);
	$.each(classes, function(index, element) { vid.classList.add(element); });
	if (bCursorOnHover) $( vid ).hover( function() { $( vid ).css('cursor','pointer'); });
	$( vid ).css("display", "none");
	$( vid ).css("position", "absolute");

	vid.setAttribute("frameborder", 0);

	vid.setAttribute("width", width);
	vid.setAttribute("height", height);
	
	vid.setAttribute("webkitallowfullscreen", "");
	vid.setAttribute("mozallowfullscreen", "");
	vid.setAttribute("allowfullscreen", "");
	vid.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"); // for youtube

	// Set width/height with style ($( ).css)

	document.body.appendChild(vid);
	return vid;
}

// set the position and dimensions of a jquery document element
function setTxtPosDim(el, x=null, y=null, w=null, h=null) {
	if (x != null) el.css("left", x);
	if (y != null) el.css("top", y);
	if (w != null) el.css("width", w);
	if (h != null) el.css("height", h);
}

function setImgPosDim(el, x=null, y=null, w=null, h=null) {
	if (x != null) el.css("left", x);
	if (y != null) el.css("top", y);
	if (w != null) el.attr("width", w);
	if (h != null) el.attr("height", h);
}

// Get the lowest position (y) of all of the elements on the page (within in the body)
function getElemsHeight() {
	var lowestY = 0;
	$(document.body).children().each( function(index, element) {
		var bottom = $( element ).offset().top + $( element ).height();
		if (bottom > lowestY) lowestY = bottom;
	});
	return lowestY;
}

function getDictValues(dct) {
	return Object.keys(dct).map(function(key){ return dct[key]; });
}

// turn a non-array into an array
function makeArray(element) {
	return isArray(element) ? element : [element];
}

// each function provided will be called consecutively
// each function should accept a promise as an argument, which finishes within the function once complete
// once the final function has finished, the returned promise will resolve
function consecCall(fnArray) {
	
	var prevDef = null;
	$.each(fnArray, function(index, fn) {
		var def = $.Deferred();
		$.when( prevDef ).done( function() { return fn(def); });
		prevDef = def;
	});
	return prevDef;
}

function beginLoadingImg(img) {
	$( img ).attr( 'src', $( img ).attr( 'src-tmp' ) );
}

function getNewImageHeight(img, toWidth) {
	return $(img).height() / $(img).width() * toWidth;
}

function isString(a) {
	return (typeof a) == "string";
}

// sensors 		[item_1, item_2, ...] 		items for which animation is triggered on enter/exit
// carrier		{ }							dictionary where timeout references are stored
// actuators	[item_3, item_4, ...]		items which are animated
// inOptions	{ }							attributes of actuators that are animated toward
// inDuration 								time in ms to complete animation
// 
function setupAnimateOnHover(sensors, carrier, actuators, queueName, inOptions, inDuration, inDelay, outOptions, outDuration, outDelay) {

	var timeoutName = "timeout_" + queueName;
	var clearTimeout = function(e) {
		if ( e[timeoutName] ) {
    		for (var i = 0; i < e[timeoutName].length; i++) clearTimeout(e[timeoutName][i]);
    		e[timeoutName] = [];
    	} else e[timeoutName] = [];
	}
	$.each(sensors, function(si, se) {

		$( se ).mouseenter( function() {
			clearTimeout( carrier );
			$.each(actuators, function(ai, ae) {
				var timeoutReference = setTimeout( function() {
		    		$( ae ).stop(queueName, true, false).animate(inOptions, {queue: queueName, duration: inDuration}).dequeue(queueName);
				}, inDelay);
				carrier[timeoutName].push(timeoutReference);
			});
		});

		$( se ).mouseleave( function() {
			clearTimeout( carrier );
			$.each(actuators, function(ai, ae) {
				var timeoutReference = setTimeout( function() {
		    		$( ae ).stop(queueName, true, false).animate(outOptions, {queue: queueName, duration: outDuration}).dequeue(queueName);
				}, outDelay);
				carrier[timeoutName].push(timeoutReference);
			});
		});
	});
}

// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
// http://detectmobilebrowsers.com/
window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function findElementWithKeyValueInArray(array, key, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key] == value) {
			return array[i];
		}
	}
	return null;
}

function isNumeric(num){
  return !isNaN(num)
}

function sortAlphabetically(thisList) {
	thisList.sort((a,b) => (a.toLowerCase() > b.toLowerCase()) ? 1 : ((b.toLowerCase() > a.toLowerCase()) ? -1 : 0));
}

function addTO(element, TO) {
	if (!element["timeout"]) element["timeout"] = [];
	element["timeout"].push(TO);
}

function clearTO(element) {
	if (element["timeout"]) {
		$.each( element["timeout"], function( index, TO ) {
			window.clearTimeout(TO);
		});
	}
}