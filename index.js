'use strict';

const HEADER_STRUCTURE = /^([A-Z]{3})/;
const NOTE_STRUCTURE = /([A-GX]#?)([1-8])([1-9]{1,2})/g;
const TWELTH_ROOT_OF_TWO = 1.059463094359;
const SEMITONES_PER_OCTAVE = 12;
const CROTCHETS_PER_BAR = 4;

const zeroNotes = new Map([['C', 16.35], ['C#', 17.32], ['D', 18.35], ['D#', 19.45], ['E', 20.6], ['F', 21.83], ['F#', 23.12], ['G', 24.5], ['G#', 25.96], ['A', 27.5], ['A#', 29.14], ['B', 30.87], ['X', 0]]);

function TinyMusic(instruments, tracks, bpm) {
    this.audioContext = new AudioContext();
    this.tracks = new Map(tracks);
    this.crotchetsPerSecond = bpm / 60;
}

TinyMusic.prototype.play = function play(trackName) {
    const track = this.tracks.get(trackName);
    const frequencies = this._parse(track);

    this._loop(frequencies);
};

TinyMusic.prototype._parse = function _parse(track) {
    const header = track.match(HEADER_STRUCTURE);
    const instrument = header[1];
    const tempo = header[2];

    const frequencies = [];
    let note;

    while ((note = NOTE_STRUCTURE.exec(track))) {
        let name = note[1];
        let octave = note[2];
        let length = note[3];

        frequencies.push({
            length,
            hz: this._convertToFrequency(name, octave, length)
        });
    }

    return frequencies;
};

TinyMusic.prototype._convertToFrequency = function _convertToFrequency(name, octave, length) {
    const baseFrequency = zeroNotes.get(name);
    return baseFrequency * Math.pow(TWELTH_ROOT_OF_TWO, SEMITONES_PER_OCTAVE * octave);
};

TinyMusic.prototype._loop = function _loop(frequencies) {
    const playPromise = frequencies.reduce((promise, freq) => promise.then(() => this._playFreq(freq)), Promise.resolve());

    playPromise.then(() => this._loop(frequencies));
};

TinyMusic.prototype._playFreq = function _playFreq(freq) {
    return new Promise(resolve => {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.value = freq.hz;

        gain.gain.value = 0.3;

        oscillator.connect(gain);
        gain.connect(this.audioContext.destination);

        oscillator.addEventListener('ended', resolve);
        oscillator.start(0);
        oscillator.stop(this.audioContext.currentTime + freq.length / this.crotchetsPerSecond / CROTCHETS_PER_BAR);
    });
};

module.exports = TinyMusic;