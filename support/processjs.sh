#!/bin/sh
#
# process.js
#
# Links the processjs.js PhantomJS script directly to Prince for a smooth
# workflow between the article.cls style and the Prince PDF generator.
#
# Usage:
#     processjs.sh filename.html
#
#
# Requires: PhantomJS - http://phantomjs.org
#           Prince    - http://www.princexml.com
#
# Copyright (c), Wannes Meert, 2012.
#
# processjs.js by Wannes Meert is licensed under a Creative Commons 
# Attribution 3.0 Unported License.

# stop on error
set -e

if [ -z "$1" ]; then
	echo "No filename given."
	echo "Usage: processjs.sh filename.html"
	exit 2;
fi

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
basename=${1%.*}
extension=${1##*.}

echo "Running JavaScript"
$dir/processjs.js $1

echo "Running prince"
echo "Reading ${basename}.nojs.html"
prince -i html5 ${basename}.nojs.html -o ${basename}.pdf

echo "Created ${basename}.pdf"
echo "Done"

