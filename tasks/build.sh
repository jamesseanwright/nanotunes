#!/usr/bin/env sh

if [ ! -e dist ]
then
    mkdir dist
fi

which closure-compiler

closure-compiler --js index.js --js_output_file dist/tinymusic.min.js --compilation_level ADVANCED_OPTIMIZATIONS --externs externs.js