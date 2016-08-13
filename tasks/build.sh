#!/usr/bin/env sh

if [ ! -e dist ]
then
    mkdir dist
fi

node_modules/.bin/babel tinymusic.js --out-file dist/tinymusic.js

closure-compiler \
    --js tinymusic.js \
    --js_output_file dist/tinymusic.min.js \
    --compilation_level ADVANCED_OPTIMIZATIONS \
    --externs externs.js

cp dist/tinymusic.min.js demo/