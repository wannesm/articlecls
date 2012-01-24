/**
 * WMArticle.js
 *
 * Copyright (c), Wannes Meert, 2012.
 *
 * Requires: jQuery
 */

/** SETTINGS ****************************************************************/

var styles = Array("modern", "classic");

/** MAIN ********************************************************************/

$(document).ready(function(){

	// Parse options
	var options = Array();
	optiontags = $('script').filter(function(index) {
		//console.log($(this)[0]);
		src = $(this)[0].getAttribute("src")
		if (src)
			return src.indexOf('wmarticle.js') >= 0;
		return false;
	});
	if (optiontags.length == 0) {
		console.log("Did not find script tag that includes wmarticle.js");
	}
	if (optiontags.length > 1) {
		console.log("Found multiple script tags that includes wmarticle.js");
	}
	optiontags.each(function(k,v) {
		//console.log(v);
		optionslist = $(this)[0].getAttribute("options").replace(" ","").split(",");
		//console.log(optionslist);
		$.each(optionslist, function(k,v) {
			option = v.split("=");
			if (option.length == 1) {
				options[option[0]] = true;
			} else if (option.length == 2) {
				options[option[0]] = option[1];
			} else {
				console.log("Error in parsing option: "+v);
			}
		});

	});

	// Modern style
	if (options["modern"] == true) {
		switchStyle("modern");
	}
	if (options["stylechooser"] == true) {
		insertStyleMenu();
	}

	// Hyphenator
	if (options["hyphenator"] == true) {
		$('p').addClass("hyphenate text");
		$.getScript("js/Hyphenator.js", function() {
			Hyphenator.config({
				displaytogglebox : false,
				minwordlength : 4
			});
			Hyphenator.run();
		});
	}

	// Add outline for tag <toc>
	insertOutline();

	// Add references
	// insert();

});

/** STYLES ******************************************************************/

function switchStyle(style) {
	$.each(styles, function(k,v) {
		$('body').removeClass(v);
	});
	$('body').addClass(style);
	removeOutline();
	insertOutline();
}

function insertStyleMenu() {
	html = "<div id=\"stylemenu\"><select><option value=\"classic\">Classic</option><option value=\"modern\">Modern</option></select></div>"
	$('body').append(html);
	$('#stylemenu select').change(function() {
		switchStyle($(this).val());
	});
}

/** TABLE OF CONTENTS *******************************************************/

function insertOutline() {
	outlinehtml = createOutline($('article'));
	if ($('#toc').length > 0) {
		$('#toc').append(outlinehtml);
	}
}

function removeOutline() {
	if ($('#toc').length > 0) {
		$('#toc ol').remove();
	}
}

function createOutline(base) {
	var html = "<ol>"

	prevlevel = 2;
	cnt = Array(0,0,0,0);
	list = $("H2,H3,H4").not(".notoc")
	list.each(function(index,value) {
		//console.log(value);
		curlevel = parseInt(value.tagName.substr(1))
		//console.log(curlevel);
		while (curlevel != prevlevel) {
			if (curlevel > prevlevel) {
				html += "<ol>";
				prevlevel += 1;
				cnt[prevlevel] = 0;
			} else {
				html += "</ol>";
				prevlevel -= 1;
			}
		}
		var classstr = ""
		if ($(this).hasClass("nonumber") || curlevel > 3) {
			classstr = " class=\"nonumber\"";
		}
		cnt[curlevel] += 1;
		var tocstr = "toc";
		for (i=0; i<=curlevel; i++) { tocstr += "_"+cnt[i]; }
		html += "<li"+classstr+"><a href=\"#"+tocstr+"\">"+value.textContent+"</a>";
		$(this).before("<a name=\""+tocstr+"\"></a>");
	});

	html += "</ol>"
	return html
}

