function Params() {

	// ============================
	// ====== SET VARIABLES =======
	// ============================

	// Max window width
	this.maxWindowW = 1042;

    // Amount of slide
    this.slideAmt = 0.7;
    // Consecutive delay of img loading
	this.delayLoadingMs = 250; // 350 // 250
	this.delayDisplayMs = 150; // 200 // 150

	// Margin Sizes (fractions of width)
	this.marginTopFrac = 0.19; // 0.075 // 0.13 // 0.169 // 0.146 // 0.17
	this.vertSpacingFrac = 0.050;
	this.marginSideFracOrig = 0.085;
	this.marginBetweenFracOrig = 0.05;

	// Image sizes
	this.minImgArea = 0.25; 	// desktop, 0.25
	this.maxImgArea = 0.5;	// mobile, 0.5

	// Body font
	this.fontSizeFrac = 0.015; // .015 // 0.018
	this.minFontSize = 10;
	this.bodyTopOffset = 0.2; // 0.35
	this.bodyLineHeightFrac = 1.5; // 1.403 // of body font size
	this.bodyLetterSpacing = 0.04; // 0.07

	// Title font
	this.titleSizeFrac = 0.065; // 0.075 // 0.09 // 0.055
	this.minTitleSize = 40;
	this.titleTopOffset = 0.61; // 0.7 // 0.5
	this.titleLeftOffset = 0.5; // 0.37
	this.bTitleAbove = true;
	this.titleLineHeight = 1.1; // 1.25
	this.titleLetterSpacing = 0.14; // 0.14

	// layout params
	this.columnOffset = 1;

	this.menuSizeFracDesktop = 0.35;
	this.subheadingSizeFracDesktop = 0.3;
	this.subheadingSizeFracMobile = 0.38;


	this.footerFrac = 0.05;

	// text color params
	this.dark = "#000000";
	this.medium = "#999999";
	this.mediumLight = "#AAAAAA";
	this.light = "#BBBBBB";
	this.lighter = "#DDDDDD";


	// MOBILE PARAMS

	// // good without the meta-screen display tag:
	// // multiplier on all text for mobile
	// this.mobileTextMult = 1.85;
	// // margin
	// this.mobileSideMarginFrac = 0.025;
	// this.mobileMarginBetweenFrac = 0.025; // unneeded
	// this.onMobile = false;
	// this.menuSizeFracMobile = 0.5;
	// this.mobileFontMult = 1.3;

	// good with the meta-tag
	// multiplier on all text for mobile
	this.mobileTextMult = 1.12;
	// margin
	this.mobileSideMarginFrac = 0.025;
	this.mobileMarginBetweenFrac = 0.025; // unneeded
	this.onMobile = false;
	this.menuSizeFracMobile = 0.5;
	this.mobileFontMult = 1.21;
	

	this.bShowBracketsOnOtherTags = false;


	// ========================
	// ======= COMPUTE ========
	// ========================

	this.origWindowW = null;
	this.windowW = null;
	this.windowH = null;
	this.windowL = null;
	this.fadeMs = null;
	this.moveMs = null;
	this.moveAmtPx = null;
	this.marginSidePx = null;
	this.marginBetweenPx = null;
	this.marginTopPx = null;
	this.vertSpacingPx = null;
	this.offsetTopPx = null;
	this.fontSizePx = null;
	this.titleSizePx = null;
	this.marginSideFrac = null;
	this.marginBetweenFrac = null;
	this.menuSizeFrac = null;
	this.menuColor = null;
	this.titleColor = null;
	this.homeCaptionColor = null;
	this.subheadingSizeFrac = null;
	this.bodyLineHeight = null;
	this.homeMarginTopPx = null;

	// fraction (in terms of windowW) to pixels
	this.f2p = function(f) { return f*this.windowW; };
	// pixels to fraction (in terms of windowW)
	this.p2f = function(p) { return p/this.windowW; };

	this.recompute = function() {

		var t = this;

		t.onMobile = window.mobilecheck();
		
		if (t.onMobile) {

			// Width extends allmost the way to the edges
			t.origWindowW = $( window ).width();
			t.windowW = t.origWindowW;
			t.windowH = $( window ).height();

			// left offset of all items
			t.windowL = (t.origWindowW - t.windowW) / 2.0;

			// Fade durations
			t.fadeMs = 740 * t.slideAmt;
			t.moveMs = 750 * t.slideAmt;
			// Number of pixels of upward movement on loading
			var moveAmtFrac = 0.12 * t.slideAmt;
			t.moveAmtPx = t.f2p( moveAmtFrac );

			// Change the margin depending on the window size
			t.marginSideFrac = t.mobileSideMarginFrac;
			t.marginSidePx = t.f2p( t.marginSideFrac );
			t.marginBetweenFrac = t.mobileMarginBetweenFrac;
			t.marginBetweenPx = t.f2p( t.marginBetweenFrac );

			// Compute the margin sizes
			t.marginTopPx = t.f2p( t.marginTopFrac * 2 ); // additional mobile multiplier
			t.vertSpacingPx = t.f2p( t.vertSpacingFrac );
			t.offsetTopPx = t.marginTopPx;

			t.homeMarginTopPx = t.marginTopPx * 1.3;

			// Get the font sizes
			t.fontSizePx = Math.max( t.f2p( t.fontSizeFrac ), t.minFontSize) * t.mobileTextMult * t.mobileFontMult;
			t.titleSizePx = Math.max( t.f2p( t.titleSizeFrac ), t.minTitleSize) * t.mobileTextMult;
			t.menuSizeFrac = t.menuSizeFracMobile;
			t.subheadingSizeFrac = t.subheadingSizeFracMobile;
			t.bodyLineHeight = t.fontSizePx * t.bodyLineHeightFrac;

			// Colors
			t.menuColor = t.light;
			t.menuColorClick = t.menuColor;
			t.titleColor = t.dark;
			t.homeCaptionColor = t.medium;
			
		} else {

			// dimensions 
			t.origWindowW = $( window ).width();
			t.windowW = Math.min(t.origWindowW, t.maxWindowW);
			t.windowH = $( window ).height();

			// left offset of all items
			t.windowL = (t.origWindowW - t.windowW) / 2.0;

			// Fade durations
			t.fadeMs = 740 * t.slideAmt;
			t.moveMs = 750 * t.slideAmt;
			// Number of pixels of upward movement on loading
			var moveAmtFrac = 0.12 * t.slideAmt;
			t.moveAmtPx = t.f2p( moveAmtFrac );

			// Change the margin depending on the window size
			var minWidth = 375;
			var maxWidth = 1042;
			t.marginSideFrac = t.marginSideFracOrig * map(t.windowW, minWidth, maxWidth, 0, 1, true);
			t.marginSideFrac = Math.max(t.marginSideFrac, 0.01);
			t.marginSidePx = t.f2p( t.marginSideFrac );
			t.marginBetweenFrac = t.marginBetweenFracOrig;
			t.marginBetweenPx = t.f2p( t.marginBetweenFrac );

			// Compute the margin sizes
			t.marginTopPx = t.f2p( t.marginTopFrac );
			t.vertSpacingPx = t.f2p( t.vertSpacingFrac );
			t.offsetTopPx = t.marginTopPx;

			t.homeMarginTopPx = t.marginTopPx * map(t.windowW, 900, 650, 1.1, 1.24, true);

			// Get the font sizes
			t.fontSizePx = Math.max( t.f2p( t.fontSizeFrac ), t.minFontSize);
			t.titleSizePx = Math.max( t.f2p( t.titleSizeFrac ), t.minTitleSize);
			t.menuSizeFrac = t.menuSizeFracDesktop;
			t.subheadingSizeFrac = t.subheadingSizeFracDesktop;
			t.bodyLineHeight = t.fontSizePx * t.bodyLineHeightFrac;

			// Colors
			t.menuColor = t.lighter;
			t.titleColor = t.dark;
			t.homeCaptionColor = t.light;
			t.menuColorClick = t.medium;
		}
	}

	// compute all variables when this class is initialized
	this.recompute();
}

