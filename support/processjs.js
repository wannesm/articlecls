#!/usr/bin/env phantomjs
// process.js
//
// Copyright (c), Wannes Meert, 2012.
//
// Requires: PhantomJS
//
// processjs.js by Wannes Meert is licensed under a Creative Commons 
// Attribution 3.0 Unported License.

var address = '';
var renderpdf = false;

function help() {
	console.log('Usage:\n    processjs.js [options] filename\n\nOptions:\n    -h    This help');
	phantom.exit();
}

// Process script arguments
if (phantom.args.length === 0) {
	console.log('Expects a filename:\n    processjs.js path/to/filename.html');
	phantom.exit();
} else {
	if (phantom.args[0] == "-h" || phantom.args[0] == "--help")
		help();
	if (phantom.args.length === 2) {
		if (phantom.args[0] == "--pdf")
			renderpdf = true;
		address = phantom.args[1];
	} else {
		address = phantom.args[0];
	}
}

console.log('Loading '+address+' ...');

var page = require('webpage').create();
var t0 = Date.now();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

//page.onResourceRequested = function (request) {
    //console.log('Request ' + JSON.stringify(request, undefined, 4));
//};
//page.onResourceReceived = function (response) {
    //console.log('Receive ' + JSON.stringify(response, undefined, 4));
//};

page.open(address, function (status) {
	if (status !== 'success') {
		console.log('FAIL to load the address');
	} else {
		// Load page
		var t1 = Date.now() - t0;
		console.log('Loading time ' + t1 + ' msec');
		var fs = require('fs');
		
		// Setup output file
		var baseaddress = address
		var lastdotidx = baseaddress.lastIndexOf('.');
		var ext = baseaddress.substring(lastdotidx+1);
		if (ext == "html" || ext == "htm") {
			baseaddress = baseaddress.substring(0,lastdotidx)
		}
		htmlout = baseaddress + ".nojs.html";
		pdfout = baseaddress + ".pdf";
		
		console.log("Processing JavaScript ...");
		t0 = Date.now();

		var saveHTML = function() {
			// Alter DOM
			var innerhtml = page.evaluate(function() {
				var html = document.getElementsByTagName("html")[0];

				// Adapt for Prince
				articlecls.insertPrince();

				// Remove all scripts
				var scripts = html.getElementsByTagName("script");
				while (scripts.length > 0) {
					scripts[0].parentNode.removeChild(scripts[0]);
				}

				return html.innerHTML;
			});
			//console.log(innerhtml);

			// Write resulting pdf to file
			if (renderpdf) {
				// This is meant for images, does not give a nice result for
				// text documents
				console.log('Writing to '+pdfout);
				page.viewportSize = { width: 1240, height: 1753 }
				page.render(pdfout);
			}

			// Write resulting html to file
			console.log('Writing to '+htmlout);
			fs.write(htmlout, innerhtml, 'w');

			phantom.exit();
		}

		// Max time for rendering
		window.setTimeout(function() {
			console.log("JavaScript processing timeout");
			saveHTML();
		}, 10000);

		var articleclsReady = false;

		// Check whether article cls is ready rendering
		// This is indicated by the articlecls.isReady variable
		var checkArticleclsReady = function() {
			var ready = page.evaluate(function() {
				console.log("... Checking articlecls.isReady: "+articlecls.isReady);
				return articlecls.isReady;
			});
			if (ready) {
				var t1 = Date.now() - t0;
				console.log('Processing time ' + t1 + ' msec');
				articleclsReady = true;
				saveHTML();
			} else {
				window.setTimeout(checkArticleclsReady, 1000);
			}
		};
		window.setTimeout(checkArticleclsReady, 1000);

	}
});


