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

var setoptions = {};
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
	// Setoptions defaults
	setoptions["nomathjax"]    = false;
	setoptions["notoc"]        = false;
	setoptions["noglossary"]   = false;
	setoptions['bibliography'] = ''

	// Process given options
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
	console.log(setoptions);

	// Insert header
	insertTitle();

	// Hyphenator
	if (setoptions["hyphenator"] == true) {
		//console.log("Activate hyphenator.js");
		$('p,li').addClass("hyphenate text");
		$.getScript("js/hyphenator/Hyphenator.js", function() {
			//console.log("Configuring hyphenator");
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
	if (!setoptions["noglossary"]) {
		insertGlossary();
	}

	// Add outline for tag <toc>
	if (!setoptions["notoc"]) {
		insertOutline();
	}

	// How-to
	// now with master style (see styles).

	// Add references
	 insertBibliography();
	
	// Add MathJax
	if (!setoptions["nomathjax"]) {
		insertMathJax();
	}

});

/** TITLE AND HEADER ********************************************************/

function insertTitle() {
	
	title = "";
	authors = [];
	date = "";
	
	$('meta').each(function(k,v) {
		if ($(this).attr('name') == 'author')
			authors.push($(this).attr('content'))
		if ($(this).attr('name') == 'dcterms.issued')
			date = $(this).attr('content');
	});
	$('title').each(function(k,v) {
		title = $(this).text()
	});

	authorsstr = ""
	$.each(authors, function(k,v) {
		authorsstr += "<span class=name>"+v+"</span>"
	});

	fields = date.match(/(\d+)/g);
	date = new Date(fields[0], fields[1]-1, fields[2]);

	headerstr = "<header><hgroup>"
		+ "<h1>"+title+"</h1>"
		+ "<div class=authors>"
		+ authorsstr
		+ "</div>"
		+ "<time datetime=\""+date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+"\" pubdate>"+months[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear()+"</time>"
		+ "</hgroup></header>"

	$('article').prepend(headerstr)
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

/** ADDRESS *****************************************************************/

/**
 * Insert an address in hCard format.
 *
 * http://microformats.org/wiki/hcard
 */
function insertAddress(data) {
	//console.log(data);
	addr = "<div class=vcard>";
	if ("fn" in data)
		addr += "<span class=fn>"+data["fn"]+"</span>";
	if ("fn n" in data) {
		addr += "<span class=\"fn n\">";
		if ("given-name" in data["fn n"])
			addr += "<span class=given-name>"+data["fn n"]["given-name"]+"</span>";
		if ("additional-name" in data["fn n"])
			addr += "<span class=additional-name>"+data["fn n"]["additional-name"]+"</span>";
		if ("family-name" in data["fn n"])
			addr += "<span class=family-name>"+data["fn n"]["family-name"]+"</span>";
		addr += "</span>";
	}
	if ("org" in data)
		addr += "<div class=org>"+data["org"]+"</div>";
	if ("adr" in data) {
		addr += "<div class=adr>";
		if ("street-address" in data["adr"])
			addr += "<div class=street-address>"+data["adr"]["street-address"]+"</div>";
		if ("postal-code" in data["adr"])
			addr += "<div class=postal-code>"+data["adr"]["postal-code"]+"</div>";
		if ("locality" in data["adr"])
			addr += "<div class=locality>"+data["adr"]["locality"]+"</div>";
		if ("region" in data["adr"])
			addr += "<div class=region>"+data["adr"]["region"]+"</div>";
		if ("country-name" in data["adr"])
			addr += "<div class=country-name>"+data["adr"]["country-name"]+"</div>";
		addr += "</div>"
	}
	if ("email" in data)
		addr += "<a class=email href=\"mailto:"+data["email"]+"\">"+data["email"]+"</a>";
	if ("url" in data)
		addr += "<a class=url href=\"mailto:"+data["url"]+"\">"+data["url"]+"</a>";
	addr += "</div>";
	document.write(addr);
}

/** MATHJAX *****************************************************************/

function insertMathJax() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src  = "http://cdn.mathjax.org/mathjax/2.0-beta/MathJax.js?config=TeX-AMS-MML_HTMLorMML";

  var config = 'MathJax.Hub.Config({' +
                 'extensions: ["tex2jax.js"],' +
                 'jax: ["input/TeX","output/HTML-CSS"],' +
                 'tex2jax: { inlineMath: [["$","$"],["\\\\(","\\\\)"]], displayMath: [["$$","$$"],["\\\\[","\\\\]"]],},' +
                 'TeX: {equationNumbers: { autoNumber: "all" }},' +
               '});' +
               'MathJax.Hub.Startup.onload();';

  if (window.opera) {script.innerHTML = config}
               else {script.text = config}

  document.getElementsByTagName("head")[0].appendChild(script);
}

/** BIBLIOGRAPHY ************************************************************/

function insertBibliography() {
	if (setoptions['bibliography'] == '')
		return;
	console.log("Start bibliograply");
	$.getScript("js/citeproc/xmle4x.js", function() {
	console.log("1");
	$.getScript("js/citeproc/xmldom.js", function() {
	console.log("2");
	$.getScript("js/citeproc/loadlocale.js", function() {
	console.log("3");
	$.getScript("js/citeproc/loadsys.js", function() {
	console.log("4");
	$.getScript("js/citeproc/loadcsl.js", function() {
	console.log("5");
	$.getScript(setoptions['bibliography'], function() {
	
		console.log("Start building bibliography");
		var sys = new Sys(abbreviations);
		var citeproc = new CSL.Engine(sys, ieee);
		citeproc.setAbbreviations("default");
		citeproc.updateItems(["Meert2012"]);
		output = citeproc.makeBibliography();
		if (output && output.length && output[1].length){
			$("#bibliography").append(output);
		}

	})
	})})})})}).fail(function(jqxhr, settings, exception) {
		console.log("ERROR");
		console.log(jqhxr);
		console.log(settings);
		console.log(exception);
	})
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
	$('body').addClass('twocolumns');
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
	//$('head').append('<link rel="stylesheet" href="css/typography_extra.css" type="text/css" />');
	$.getScript("js/opentypography/DOMhelp.js", function() {
		$.getScript("js/opentypography/typesetter.js", function() {

			$('p, li').addClass("typo");
			charReplacements();
		});
	});
}

