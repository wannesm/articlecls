/**
 * WMArticle.js
 *
 * Copyright (c), Wannes Meert, 2012.
 *
 * Requires: jQuery
 *
 * wmarticle by Wannes Meert is licensed under a Creative Commons Attribution
 * 3.0 Unported License.
 */

/** SETTINGS ****************************************************************/

var styles = Array("modernstyle", "classicstyle", "twocolumnsstyle", "htmlhowtostyle");
var setoptions = {};
var curstyle = "classicstyle";

/** MAIN ********************************************************************/

$(document).ready(function(){

	// Parse options
	optiontags = $('script').filter(function(index) {
		src = $(this).first().attr("src")
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
		optionslist = $(this).first().attr("data-options").replace(/ +/g,"").split(",");
		//console.log(optionslist);
		$.each(optionslist, function(k,v) {
			option = v.split("=");
			if (option.length == 1) {
				setoptions[option[0]] = true;
			} else if (option.length == 2) {
				setoptions[option[0]] = option[1];
			} else {
				console.log("Error in parsing option: "+v);
			}
		});

	});
	//console.log(setoptions);

	// Modern style
	if (setoptions["modernstyle"] == true) {
		//console.log("Style: modernstyle");
		switchStyle("modernstyle");
	}
	if (setoptions["htmlhowtostyle"] == true) {
		//console.log("Style: htmlhowtostyle");
		switchStyle("htmlhowtostyle");
	}
	if (setoptions["stylechooser"] == true) {
		insertStyleMenu();
	}

	// Hyphenator
	if (setoptions["hyphenator"] == true) {
		//console.log("Activate hyphenator.js");
		$('p,li').addClass("hyphenate text");
		$.getScript("js/Hyphenator.js", function() {
			Hyphenator.config({
				displaytogglebox : false,
				minwordlength : 4
			});
			Hyphenator.run();
		});
	}

	// Footnotes
	if (setoptions["altfootnotes"]) {
		//console.log("Activate alternative footnotes");
		setAlternativeFootnotes();
	}

	// Twocolumns
	if (setoptions["twocolumns"]) {
		//console.log("Activate two columns");
		setTwoColumns();
	}

	// Add outline for tag <toc>
	insertOutline();

	// How-to
	// now with master style (see styles).

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
	curstyle = style;
}

function insertStyleMenu() {
	html = "<div id=\"stylemenu\"><select>"
		+ "<option value=\"classic\">Classic</option>"
		+ "<option value=\"modernstyle\">Modern</option>"
		+ "<option value=\"twocolumnsstyle\">Two-columns</option>"
		+ "<option value=\"htmlhowtostyle\">How-To HTML</option>"
		+ "</select></div>"
	$('body').append(html);
	$('#stylemenu select').change(function() {
		switchStyle($(this).val());
	});
	$('#stylemenu option').filter('[value='+curstyle+']').first().attr('selected','selected')
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
		links = $(this).parent().children('a').filter(function(i) {
			//console.log($(this));
			name = $(this).first().attr("name")
			//console.log(name);
			if (name == tocstr) {
				return true
			}
			return false;
		});
		//console.log(links);
		if (links.length == 0) {
			$(this).before("<a name=\""+tocstr+"\"></a>");
		}
	});

	html += "</ol>"
	return html
}

function setAlternativeFootnotes() {
	var footnotecount = 0;
	$('.footnote').each(function(k,v) {
		footnotecount += 1;
		$(this).addClass("inline-footnote");
		$(this).before("<sup>"+footnotecount+"</sup>");
		$(this).prepend("<b>"+footnotecount+"</b> ");
	});
}

function setTwoColumns() {
	$('body').addClass('twocolumnsstyle');
}

