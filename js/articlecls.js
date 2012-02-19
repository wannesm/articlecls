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
	initArticleCls();
});

function initArticleCls() {
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
	setoptions["meeting"]      = false;
	setoptions['citationstyle']= 'ieee';

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
	//console.log(setoptions);

	// Insert header
	insertGenerator();
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
	
	// Apply meeting minutes
	if (setoptions["meeting"]) {
		applyMeetingMinutes();
	}
}

/** GENERATOR ***************************************************************/

function insertGenerator() {
	$('head').prepend("<meta name=\"generator\" content=\"Article.cls\" />");
}

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

	article = $('article')
	if (article.length > 0)
		article.prepend(headerstr);
	else
		$('body').prepend(headerstr);
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

/**
 * Add bibliography using citeproc-js
 *
 * http://gsl-nagoya-u.net/http/pub/citeproc-doc.html
 */
function insertBibliography() {
	if (setoptions['bibliography'] == '')
		return;
	// Can't get dataType to work with e4x=1
	//$.ajax({
		//url:"js/citeproc/xmle4x.js",
		//dataType: "text/javascript; e4x=1",
		//type: "text/javascript; e4x=1",
		//success: function() {
	$.getScript("js/citeproc/xmldom.js", function() {
	$.getScript("js/citeproc/citeproc.js", function() {
	$.getScript("js/citeproc/loadlocale.js", function() {
	$.getScript("js/citeproc/loadsys.js", function() {
	$.getScript("js/citeproc/loadcsl.js", function() {
		//console.log("Loading bibfile "+setoptions['bibliography']);
	$.getScript(setoptions['bibliography'], function() {
		//console.log("Using bibstyle "+setoptions['citationstyle']);
		var sys = new Sys(bibabbr);
		//var citeproc = new CSL.Engine(sys, bibstyles['myieee']);
		var citeproc = new CSL.Engine(sys, citationstyles[setoptions['citationstyle']]);
		citeproc.setAbbreviations("default");
		keys = [];
		$('a.cite').each(function(k,v) {
			key = $(this).attr('href').substr(1);
			keys.push(key);
		});
		citeproc.updateItems(keys);
		output = citeproc.makeBibliography();
		if (output && output.length && output[1].length){
			htmloutput = output[0].bibstart + output[1].join("") + output[0].bibend;
			$("#bibliography").append(htmloutput);
		}
		$('a.cite').each(function(k,v) {
			key = $(this).attr('href').substr(1);
			citation_object = {"citationItems": [{"id": key}],"properties": {"noteIndex": 0}}
			ref = citeproc.appendCitationCluster(citation_object,true);
			$(this).html(ref[0][1]);
			$('#bibliography .csl-entry').eq(ref[0][0]).attr('id',key);
		});
		$('#bibliography .csl-bib-body').css('margin-left', output.maxoffset+1+'em');

	}).fail(function(jqxhr, settings, exception) {
		console.log("ERROR loading "+setoptions['bibliography']);
		console.log(jqxhr);
		console.log(settings);
		console.log(exception);
	})
	})})})})})
	//}}).fail(function(jqxhr, settings, exception) {
		//console.log("ERROR loading xmle4x.js");
		//console.log(jqxhr);
		//console.log(settings);
		//console.log(exception);
	//})
}

/** MEETING MINUTES *********************************************************/

/**
 * Todos in meeting minutes appointed to someone with the @name syntax are
 * highlighted.
 */
function applyMeetingMinutes() {
	//console.log("Applying meeting minutes");
	match = /([^a-zA-Z0-9])(@\w+)/ig;
	replacement = "$1<span class=at>$2</span>";
	$('li,p').each(function(k,v) {
		$(this).html($(this).html().replace(match,replacement))
	});
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

