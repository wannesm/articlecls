/**
 * articlecls.js
 *
 * Copyright (c), Wannes Meert, 2012.
 *
 * Requires: jQuery
 *
 * articlecls by Wannes Meert is licensed under a Creative Commons Attribution
 * 3.0 Unported License.
 */

/** SETTINGS ****************************************************************/

var styles = Array("modernstyle", "classicstyle", "twocolumnsstyle", "htmlhowtostyle");
var setoptions = {};
var curstyle = "classicstyle";
var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/** MAIN ********************************************************************/

$(document).ready(function(){

	// Parse options
	optiontags = $('script').filter(function(index) {
		src = $(this).first().attr("src")
		if (src)
			return src.indexOf('articlecls.js') >= 0;
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
				setoptions[option[0]] = true;
			} else if (option.length == 2) {
				setoptions[option[0]] = option[1];
			} else {
				console.log("Error in parsing option: "+v);
			}
		});

	});
	//console.log(setoptions);

	// Insert header
	insertTitle();

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

	// Open Typography
	if (setoptions["opentypography"]) {
		useOpenTypography();
	}

	// Add glossary
	insertGlossary();

	// Add outline for tag <toc>
	insertOutline();

	// How-to
	// now with master style (see styles).

	// Add references
	// insert();

});

/** TITLE AND HEADER ********************************************************/

function insertTitle() {
	
	title = "";
	authors = [];
	date = "";
	
	$('meta').each(function(k,v) {
		if ($(this).attr('name') == 'author')
			authors.push($(this).attr('content'))
		if ($(this).attr('name') == 'date')
			date = $(this).attr('content');
	});
	$('title').each(function(k,v) {
		title = $(this).text()
	});

	authorsstr = ""
	$.each(authors, function(k,v) {
		authorsstr += "<span class=name>Wannes Meert</span>"
	});

	fields = date.match(/(\d+)/g);
	date = new Date(fields[0], fields[1]-1, fields[2]);

	headerstr = "<header><hgroup>"
		+ "<h1>Article.cls</h1>"
		+ "<div class=authors>"
		+ authorsstr
		+ "</div>"
		+ "<time datetime=\""+date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+"\" pubdate>"+months[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear()+"</time>"
		+ "</hgroup></header>"

	$('article').prepend(headerstr)
}

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

/** OTHER *******************************************************************/

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

function insertGlossary() {
	if ($('#glossary').length == 0)
		return;
	
	gloss = [];

	// Find glossary items
	$('abbr').filter(function(i) {
		if ($(this).hasClass('noglossary'))
			return false;
		return true;
	}).each(function(k,v) {
		dg = $(this).first().attr("title");
		if (dg) {
			txt = $(this).first().text();
			gloss.push([txt,dg]);
			$(this).addClass("inglossary");
		}
	});

	// Sort glossary by abbrevation
	gloss.sort(function(a,b) {
		x = a[0];
		y = b[0];
		return x < y ? -1 : (x > y ? 1 : 0);
	});

	// And insert
	$('#glossary').each(function(i) {
		$(this).append("<dl></dl>");
		root = $(this).children().filter('dl');
		$.each(gloss, function(k,v) {
			root.append("<dt>"+v[0]+"<dd>"+v[1]);
		});
	});
}

function useOpenTypography() {
	$('head').append('<link rel="stylesheet" href="css/typography_extra.css" type="text/css" />');
	$.getScript("js/charReplacements.js", function() {
		$.getScript("js/typography.js", function() {

			$('p, li').addClass("typo");
			smallcapsReplacement();
		});
	});
}

