#!/usr/bin/env sh

if [ ! -e dist ]
then
    mkdir dist
fi

node_modules/.bin/babel nanotunes.js --out-file dist/nanotunes.js

closure-compiler \
    --js nanotunes.js \
    --js_output_file dist/nanotunes.min.js \
    --compilation_level ADVANCED_OPTIMIZATIONS \
    --externs externs.js

cp dist/nanotunes.min.js demo/