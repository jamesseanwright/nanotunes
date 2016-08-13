# TinyMusic

TinyMusic is a small schema for structuring music. This repository includes a JavaScript implementation, built upon [`OscillatorNode`](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode).

Developers must shape their own sounds; TinyMusic is simply a means of representing the notes that should be played, and for how long per bar.

## The Schema

The general structure is:

`<Instrument Name /><Note 1><Letter /><Octave /><Length /></Note 1>...<Note n><Letter /><Octave /><Length /></Note>`

Where:

* `<Instrument Name>` is a three-character string that refers to a previously defined instrument
* `<Note n>` is a string composed of three ordered parts:
    * The note's musical letter (A-G), and an optional # to sharpen the note by a semitone
    * The octave (1-8)
    * The length of the note (1-16)


### A "Note" On Note Lengths

As of this version, TinyMusic only supports semiquaver (1/16th) resolution (this will hopefully be increased in the next major release.) Essentially, this means:

* A note length of `16` will last for a whole bar (semibreve)
* A note length of `8` will last for half a bar (minim)
* A note length of `4` will last for half a bar (crotchet)
* A note length of `2` will last for half a bar (quaver)
* A note length of `1` will last for half a bar (semiquaver)


### Example

`VOXC44A#412` translates to:

* Play this track with a user-defined instrument called "VOX";
* Play C4 for a quaver length;
* Play A#4 for the remainder of the bar;


## JavaScript Implementation

API docs coming shortly. In the meantime, here's the setup code from `demo/index.html` Instrument properties for wave, pan, and gain all conform to the Web Audio API.

```
'use strict';

var instruments = {
    VOX: {
        wave: 'square',
        pan: -0.5,
        gain: 0.3
    },

    BSS: {
        wave: 'triangle',
        pan: 0.5,
        gain: 0.7
    },

    GTR: {
        wave: 'sawtooth',
        pan: 0.8,
        gain: 0.4
    },
};

var tracks = {
    title: {
        bpm: 180,

        parts: [
            'VOXC44C44G44A44A#44A44G44E44',
            'GTRC32C42C32C42E32E42E32E42G32G42G32G42C32C42C32C4',
            'BSSC24C24G14G14A#14A#14B14B14',
        ]
    }
};

var tinyMusic = new TM(instruments, tracks);

tinyMusic.play('title');
```


### Setup

**Note:** This library isn't available on npm or Bower, but I'll publish respective packages if needed.

There are two scripts in the `dist` directory

* An unminified version if you minify everything
* A minified version for those who bundle third-party dependencies separately

Including this script will attach the `TM` constructor to the `window` object.


### API

TODO


### File Sizes:

* Unminified - 3.7 KB
* Minified - 1.3 KB
* Minified and gzipped - 704 bytes


### Building Locally

TODO


## Tests

TODO