#!/bin/sh

dir=$(pwd)"/"$(dirname $0)
#echo $dir

echo "Running JavaScript"
$dir/processjs.js $dir/../articlecls.html

echo "Running prince"
prince $dir/../articlecls.nojs.html -o $dir/../articlecls.pdf

echo "Done"

