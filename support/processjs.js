#!/usr/bin/env phantomjs
// process.js
// Copyright, 2012, Wannes Meert

var address = '';
var renderpdf = false;

if (phantom.args.length === 0) {
	console.log('Expects a filename:\n    processjs.js path/to/filename.html');
	phantom.exit();
} else {
	if (phantom.args.length === 2) {
		if (phantom.args[0] == "--pdf")
			renderpdf = true;
		address = phantom.args[1];
	} else {
		address = phantom.args[0];
	}
}

console.log('Processing '+address);

var page = require('webpage').create();
var t = Date.now();

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
		t = Date.now() - t;
		console.log('Loading time ' + t + ' msec');
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
		
		if (renderpdf) {
			console.log('Writing to '+pdfout);
			page.viewportSize = { width: 480, height: 800 }
			window.setTimeout(function () {
				page.render(pdfout);
				phantom.exit();
				}, 2000000);
		}

		console.log("Waiting for scripts to end");

		var saveHTML = function() {
			// Alter DOM
			var innerhtml = page.evaluate(function() {
				var html = document.getElementsByTagName("html")[0];

				console.log("Changing html");
				console.log("Article.cls ready: "+articlecls.isReady);

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

			// Write result to output file
			console.log('Writing to '+htmlout);
			fs.write(htmlout, innerhtml, 'w');

			phantom.exit();
		}

		var articleclsReady = false;

		// Max time for rendering
		window.setTimeout(function() { saveHTML() }, 10000);

		// Check whether article cls is ready rendering
		var checkArticleclsReady = function() {
			var ready = page.evaluate(function() {
				console.log("Checking articlecls.isReady: "+articlecls.isReady);
				return articlecls.isReady;
			});
			if (ready) {
				console.log("Article.cls is ready");
				articleclsReady = true;
				saveHTML();
			} else {
				window.setTimeout(checkArticleclsReady, 1000);
			}
		};
		window.setTimeout(checkArticleclsReady, 1000);

	}
});


