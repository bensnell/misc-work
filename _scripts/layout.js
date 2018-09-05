// Layout helpers

function MobileLayout(colWidth) {
	// one column only

	// params
	this.vertMarginFrac = 0.13;

	// ==========

	// calculations
	this.colWidth = colWidth;

	this.imgCounter = -1;
	this.rects = [];
	this.vertMarginPx = w.f2p(this.vertMarginFrac);

	// hacky for now
	this.addOffset = function(dx, dy) {
		if (this.rects.length > 0) {
			this.rects[this.rects.length-1].x += dx;
			this.rects[this.rects.length-1].y += dy;
		}
	}

	this.getImagePosition = function(imgW, imgH) {

	  	// Increment the counters
	  	this.imgCounter += 1;

	  	// Create the variables that will be output
	  	var x, y, w, h;

	  	// Set the final width and height
	  	w = imgW;
	  	h = imgH;
	  	// Adjust to fit within the column
	  	var mult = this.colWidth / imgW;
	  	w *= mult;
  		h *= mult;

	  	// Find the x location
	  	x = 0;

	  	// now find the y location
	  	y = 0;
	  	if (this.rects.length > 0) {
	  		y = this.rects[this.rects.length-1].b() + this.vertMarginPx;
	  	}

	  	// now save and output
	  	var outRect = new rect(x, y, w, h)

	  	this.rects.push(outRect);

	  	return outRect;
	};
}

function DesktopLayout(nCols, colWidth, colMargin, indexOffset) {

    this.nCols = nCols;
    this.colWidth = colWidth;
    this.colMargin = colMargin;
    this.indexOffset = indexOffset;

    // Define a few global variables
    this.imgCounter = -1;
    this.rects = [];


    // ===== Parameters ======

    this.maxLandscapeMult = 1.5; // mult of the col radius

    this.maxIters = 1;
    this.nSamples = 10;
    this.searchRadiusMult = 1.5; // mult of the col radius

    // Inhibitors 
    // 1 = full inhibition
    this.intersectionInhibitor = 1;
    this.containmentInhibitor = 1; 
    this.edgeStDevMult = 0.08; // as a function of column width

    // Bounds on acceptable amounts of white space
    this.spaceLoMeanMult = 0.3;
    this.spaceLoStdevMult = 0.1;
    this.spaceHiMeanMult = 1.6;
    this.spaceHiStdevMult = 0.1;

    // amount of intersection to set 
    this.intersectionThreshold = 0.5;


    // ===== Calculations ======

    this.edgeStDevPx = this.edgeStDevMult * this.colWidth;
    this.spaceLoMeanPx = this.spaceLoMeanMult * this.colWidth;
    this.spaceLoStdevPx = this.spaceLoStdevMult * this.colWidth;
    this.spaceHiMeanPx = this.spaceHiMeanMult * this.colWidth;
    this.spaceHiStdevPx = this.spaceHiStdevMult * this.colWidth;


    // Get the likelihood of a specific rectangle given existing rectangles
    this.getLikelihood = function(thisRect) {

	  	like = 1;

	  	// Anything off the edge of the page is unacceptable
	  	if (thisRect.y < 0) {
	  		like *= 0;
	  	}

	  	// Intersecting images are not likely
	  	for (var i = 0; i < this.rects.length; i++) {
	  		if (this.rects[i].intersects(thisRect)) {
	  			like *= (1 - this.intersectionInhibitor);
	  			break;
	  		}
	  	}

	  	// Images contained within each other vertically are not likely
	  	// todo: only check the most recent ones
	  	for (var i = 0; i < this.rects.length; i++) {
	  		if ( this.rects[i].inx(thisRect, "AandB", 1, "self") == 1 || thisRect.inx(this.rects[i], "AandB", 1, "self") == 1 ) {
	  			like *= (1 - this.containmentInhibitor);
	  			break;
	  		}
	  	}

	  	// Don't let edges of neighboring images come close
	  	// Calculate the likelihood for all edges of last 2 images
	  	// todo: make faster by checking distances
	  	var calcLast = 2;
		for (var i = Math.max(this.rects.length-1,-1); i >= Math.max(this.rects.length-1-calcLast,0); i--) {

			// compare tops and bottoms
			like *= (1 - gaussian(this.rects[i].y, thisRect.y, this.edgeStDevPx, true));
			like *= (1 - gaussian(this.rects[i].y, thisRect.b(), this.edgeStDevPx, true));
			like *= (1 - gaussian(this.rects[i].b(), thisRect.y, this.edgeStDevPx, true));
			like *= (1 - gaussian(this.rects[i].b(), thisRect.b(), this.edgeStDevPx, true));
	  	}	  	
	  	
	  	// Impose bounds on the largest and smallest amount of white space
	  	// First, find the distance to the nearest image
	  	var bottom = 0;
	  	for (var i = Math.max(this.rects.length-1, -1); i >= 0; i--) {
	  		if (this.rects[i].inx(thisRect, "AandB", 0, "self") >= this.intersectionThreshold) {
	  			// rectangles are stacked
	  			bottom = this.rects[i].b();
	  			break;
	  		}
	  	}

	  	// if (this.rects.length != 0) bottom = this.rects[this.rects.length-1].b();
	  	// Apply the inhibitors
	  	var diff = thisRect.y - bottom;
	  	// Lower bound on the white space -- only applied if bottom != 0
	  	if (bottom != 0) {
		  	like *= (1 - logisticSimple(diff, this.spaceLoMeanPx, this.spaceLoStdevPx, false));
		}
	  	// Higher bound on the white space
	  	like *= (1 - logisticSimple(diff, this.spaceHiMeanPx, this.spaceHiStdevPx, true));


	  	// If an image has no neighbors above, push it higher upwards


	  	// If there has been a lot of overlap, make room with some white space (?)


	  	return like;
	};


 	// Return a rect describing the image location within the column matrix
 	this.getImagePosition = function(imgW, imgH) {

	  	// Increment the counters
	  	this.imgCounter += 1;

	  	// Create the variables that will be output
	  	var x, y, w, h;

	  	// Set the final width and height
	  	w = imgW;
	  	h = imgH;
	  	// Adjust to fit within the column
	  	var mult = this.colWidth / imgW;
	  	if (w/h > 1.01) {
	  		// If the image is landscape, increase its width so the
	  		// area is more reasonably comparable
	  		mult *= this.maxLandscapeMult;
	  	}
	  	w *= mult;
  		h *= mult;

	  	// Find the x location
	  	var col = (this.imgCounter + this.indexOffset) % this.nCols;
	  	x = col * (this.colWidth + this.colMargin);
	  	if (w > this.colWidth) {

	  		// If the image is on the right, switch it
	  		// If the image is in the middle, randomly choose a side
	  		if (col == (this.nCols - 1) || (col > 0 && Math.random() < 0.5) ) {
	  			x -= (w-this.colWidth);
	  		}
	  	}

	  	var iters = 0
	  	var center = 0;
  		if (this.rects.length != 0) {
  			var lastRect = this.rects[this.rects.length-1];
  			center = lastRect.y + lastRect.h;
  		}
	  	var radius = this.searchRadiusMult * this.colWidth;
	  	while (iters <= this.maxIters && this.rects.length != 0) { // only complete if not first rect

	  		// Choose n samples and find the likelihood at each
	  		// The radius is relative to the last offset
	  		var searchRadius = (this.searchRadiusMult * this.colWidth) * Math.pow(0.25, iters)
	  		var yLo = center - searchRadius;
	  		var yHi = center + searchRadius;
	  		var yLocs = rangeVals(yLo, yHi, this.nSamples);

	  		// For each location, find the overall likelihood
	  		var likes = []
	  		var self = this;
	  		$.each(yLocs, function(index, element) {

	  			// Add the likelihood
	  			var thisRect = new rect(x, element, w, h);
	  			var thisLike = self.getLikelihood( thisRect );
	  			likes.push( [ thisRect, thisLike ]);
	  		});

	  		// Sort to find the highest likelihood
			likes.sort( function(a,b) { return a[1] < b[1]; } );

			// Save the y value of the highest rated location
			center = likes[0][0].y

			// increment the iteration
	  		iters += 1;
	  	}
	  	y = center;
	  	var outRect = new rect(x, y, w, h)

	  	this.rects.push(outRect);

	  	return outRect;
	};	
};

function ColumnLayout() {

	// breakpoints
	this.tabletWidth = 768;
	this.phoneWidth = 480;

	// Using the width of the screen, determine the number of columns we'll have
	// and the size / margins of these columns
	this.nCols = w.windowW<this.phoneWidth ? 1 : (w.windowW<this.tabletWidth ? 2 : 3);
	this.usableWidth = w.windowW - 2*w.marginSidePx;
	this.marginBetween = w.f2p(this.nCols==1 ? 0 : (0.04 * Math.pow(0.7, Math.max(this.nCols-2, 0))));
	this.colWidth = (this.usableWidth - this.marginBetween*(this.nCols-1)) / this.nCols;
	this.marginVertical = this.marginBetween*1.3;

	this.cols = [];
	for (var i = 0; i < this.nCols; i++) {
		var thisCol = [];
		var thisRect = new rect(i*(this.colWidth+this.marginBetween), -this.marginVertical, this.colWidth, 0);
		thisRect.col = i;
		thisCol.push(thisRect);
		this.cols.push(thisCol);
	}

	this.addOffset = function(col, dy) {
		this.cols[col][this.cols[col].length-1].h += dy;
	}

	this.getImagePosition = function(imgW, imgH) {

	  	var x, y, w, h;

	  	// dimensions
	  	w = imgW; h = imgH;
	  	var mult = this.colWidth / imgW;
	  	w *= mult; h *= mult;

	  	// position
	  	var lowestCol = 0;
	  	var lowestY = 1000000;
	  	for (var i = 0; i < this.cols.length; i++) {
	  		var col = this.cols[i];
	  		var bottom = col[col.length-1].b() + this.marginVertical;
	  		if (bottom < lowestY) {
	  			lowestY = bottom;
	  			lowestCol = i;
	  		}
	  	}
	  	x = lowestCol * (this.colWidth + this.marginBetween);
	  	y = this.cols[lowestCol][this.cols[lowestCol].length-1].b() + this.marginVertical;

	  	var outRect = new rect(x, y, w, h);
	  	outRect.col = lowestCol;
	  	this.cols[lowestCol].push(outRect);
	  	return outRect;
	}
}





