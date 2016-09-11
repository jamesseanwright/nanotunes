# NanoTunes

NanoTunes is a small schema for structuring music. This repository includes a JavaScript implementation, built upon [`OscillatorNode`](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode).

Developers must shape their own sounds; NanoTunes is simply a means of representing the notes that should be played, and for how long per bar.

Try out the [demo](https://jamesseanwright.github.io/nanotunes/).

## The Schema

The general structure is:

`<Instrument Name /><Note 1><Letter /><Octave /><Length /></Note 1>...<Note n><Letter /><Octave /><Length /></Note>`

Where:

* `<Instrument Name>` is a three-character string that refers to a previously defined instrument
* `<Note n>` is a string composed of three ordered parts:
    * The note's musical letter (A-G), and an optional # to sharpen the note by a semitone. The letter X can be used as a rest note
    * The octave (1-8)
    * The length of the note (1-16)


### A "Note" On Note Lengths

As of this version, NanoTunes only supports semiquaver (1/16th) resolution (this will hopefully be increased in the next major release.) Essentially, this means:

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

### Example

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
        isLooping: true,

        parts: [
            'VOXC44C44G44A44A#44A44G44E44',
            'GTRC32C42C32C42E32E42E32E42G32G42G32G42C32C42C32C4',
            'BSSC24C24G14G14A#14A#14B14B14',
        ]
    }
};

var nanoTunes = new NT(instruments, tracks);

nanoTunes.play('title');
```

### File Sizes:

* Unminified - 4.3 KB
* Minified - 1.6 KB
* Minified and gzipped - 830 bytes


### Browser Compatibility

* Chrome
* Firefox
* Edge
* Safari - works, but somewhat buggy


### Setup

**Note:** This library isn't available on npm or Bower, but I'll publish respective packages if requested.

There are two scripts in the `dist` directory

* An unminified version for those who minify everything
* A minified version for those who bundle third-party dependencies separately

Loading this script will attach the `NT` constructor to the `window` object.


### API

#### `NT(instruments, tracks [, audioContext])`

A constructor function to create a new instance of NanoTunes. The third parameter, which is optional, allows you to use a previously instantiated `AudioContext`. This is desirable if, for example, you're also generating sound effects with the Web Audio API.

#### Defining Instruments

The `instruments` parameter is an `Object` whose keys are three-letter instrument names. The below properties can be configured for each definition. most of which conform with the Web Audio API:

* `wave` - the instrument's waveform. This can be any value assignable value to [`OscillatorNode.type`](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/typehttps://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/type). Unfortunately, custom waves aren't supported at this time, but will be available in the next major release

* `pan` - controls the instrument's stereo panning. Like `StereoPannerNode`'s [`pan`](https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode/pan) property, it can range from -1 for the left speaker, to 1 for the right speaker

* `gain` - controls the instrument's pre-output gain. Like `GainNode`'s [`gain`](https://developer.mozilla.org/en-US/docs/Web/API/GainNode/gain) property, it can be a positive number


#### Defining Tracks

The `tracks` parameter is an `Object` whose keys are identifiable track names. For each, these properties can be specified:

* `bpm`: - the song's beats per minute

* `isLooping` - the song will loop infinitely if this is truthy, otherwise it will automatically stop after a single play

* `parts` - an array of strings for each track. These will be played in parallel


#### `NT.prototype.play(trackName)`

Plays a track by name.


#### `NT.prototype.stop()`

Stops playing the current track.


#### The `onStop` callback

It's possible to attach a method to your NanoTunes instance called `onStop`. This will invoke whenever a non-looping track ends. This is useful for scheduling.

```
var nanoTunes = new NT(instruments, tracks);

nanoTunes.onStop = function onStop() {
    console.log('Current track has ended.');
};
```


### Building Locally

Despite NanoTunes being unavailable on npm, it needs to be installed in order to install some of the build dependencies.

Additionally, the minified build is generated by [Closure Compiler](https://developers.google.com/closure/compiler/docs/gettingstarted_app). You'll need to download the compiler JAR and expose it to your environment as `closure-compiler`. You can achieve this by writing a [shell wrapper](https://gist.github.com/jamesseanwright/4b8e4c907c231a0f7ee71e01f5a33163) and placing this in one of your `$PATH`'s directories.

Once installed, run `npm i` in the project's directory, which will install Babel. This is used to transpile ES2015 block variables and arrow functions to their ES5 counterparts, because Closure Compiler doesn't support this latest standard as a compilation target. I therefore thought that it would beneficial to align the languages of both the unminified and minified versions. Once Closure supports ES2015 traspilation, Babel will be removed.


#### Scripts

* `npm run build` - builds both versions of the distributable, and copies the minified version to the `demo` directory


### Tests

There are no unit tests as of yet. These will be written once js13kGames 2016 is over.