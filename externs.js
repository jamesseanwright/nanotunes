/* externs definition for Closure
 * Compiler to protect constructor name */

var NT = function () {};

var track = {
    bpm: 0,
    isLooping: false,
    parts: []
};

var instrument = {
    wave: 'square',
    gain: 0,
    track: 0
};

NT.prototype.onStop = function () {};