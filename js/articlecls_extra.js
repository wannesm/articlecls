
var styleoptions = {};
var styles = Array("modernstyle", "classicstyle", "twocolumnsstyle", "htmlhowtostyle", "latexcmpstyle");
var curstyle = "classicstyle";

$(document).ready(function(){
	//console.log("Articlecls EXTRA");

	// Parse options
	optiontags = $('script').filter(function(index) {
		src = $(this).first().attr("src")
		if (src)
			return src.indexOf('articlecls_extra.js') >= 0;
		return false;
	});
	if (optiontags.length == 0) {
		console.log("Did not find script tag that includes articlecls.js");
	}
	if (optiontags.length > 1) {
		console.log("Found multiple script tags that includes articlecls.js");
	}
	optiontags.each(function(k,v) {
		//console.log(v);
		optionslist = $(this).first().attr("data-options").replace(/ +/g,"").split(",");
		//console.log(optionslist);
		$.each(optionslist, function(k,v) {
			option = v.split("=");
			if (option.length == 1) {
				styleoptions[option[0]] = true;
			} else if (option.length == 2) {
				styleoptions[option[0]] = option[1];
			} else {
				console.log("Error in parsing option: "+v);
			}
		});

	});
	//console.log(styleoptions);

	// Modern style
	if (styleoptions["modernstyle"] == true) {
		//console.log("Style: modernstyle");
		switchStyle("modernstyle");
	}
	if (styleoptions["htmlhowtostyle"] == true) {
		//console.log("Style: htmlhowtostyle");
		switchStyle("htmlhowtostyle");
	}
	if (styleoptions["twocolumnsstyle"] == true) {
		//console.log("Style: twocolumnsstyle");
		switchStyle("twocolumnsstyle");
	}
	if (styleoptions["latexcmpstyle"] == true) {
		//console.log("Style: htmlhowtostyle");
		switchStyle("latexcmpstyle");
	}
	if (styleoptions["stylechooser"] == true) {
		insertStyleMenu();
	}
})

/** STYLES ******************************************************************/

function switchStyle(style) {
	$.each(styles, function(k,v) {
		$('body').removeClass(v);
	});
	$('body').addClass(style);
	if (style == "twocolumnsstyle") {
		$('body').addClass('twocolumns');
	} else {
		$('body').removeClass('twocolumns');
	}
	removeOutline();
	insertOutline();
	curstyle = style;
}

function insertStyleMenu() {
	html = "<div id=\"stylemenu\"><select>"
		+ "<option value=\"classicstyle\">Classic</option>"
		+ "<option value=\"modernstyle\">Modern</option>"
		+ "<option value=\"twocolumnsstyle\">Two-columns</option>"
		+ "<option value=\"htmlhowtostyle\">How-To HTML</option>"
		+ "<option value=\"latexcmpstyle\">Latex compare</option>"
		+ "</select></div>"
	$('body').append(html);
	$('#stylemenu select').change(function() {
		switchStyle($(this).val());
	});
	$('#stylemenu option').filter('[value='+curstyle+']').first().attr('selected','selected')
}
