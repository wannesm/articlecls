#!/bin/sh
#
# process.js
#
# Copyright (c), Wannes Meert, 2012.
#
# Requires: PhantomJS, Prince
#
# processjs.js by Wannes Meert is licensed under a Creative Commons 
# Attribution 3.0 Unported License.

# Usage:
#     processjs.sh filename.html
#
#

if [ -z "$1" ]; then
	echo "No filename given."
	echo "Usage: processjs.sh filename.html"
	exit 2;
fi

dir=$(pwd)"/"$(dirname $0)
basename=${1%.*}
extension=${1##*.}

echo "Running JavaScript"
$dir/processjs.js $1

echo "Running prince"
echo "Reading ${basename}.nojs.html"
prince ${basename}.nojs.html -o ${basename}.pdf

echo "Created ${basename}.pdf"
echo "Done"

