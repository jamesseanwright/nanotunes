(function () {
    'use strict';

    const HEADER_STRUCTURE = /^([A-Z]{3})/;
    const NOTE_STRUCTURE = /([A-GX]#?)([1-8])([1-9]{1,2})/g;
    const TWELTH_ROOT_OF_TWO = 1.059463094359;
    const SEMITONES_PER_OCTAVE = 12;
    const CROTCHETS_PER_BAR = 4;

    const zeroNotes = new Map([['C', 16.35], ['C#', 17.32], ['D', 18.35], ['D#', 19.45], ['E', 20.6], ['F', 21.83], ['F#', 23.12], ['G', 24.5], ['G#', 25.96], ['A', 27.5], ['A#', 29.14], ['B', 30.87], ['X', 0]]);

    function TM(instruments, tracks) {
        this.audioContext = new AudioContext();
        this.tracks = tracks;
    }

    TM.prototype.play = function play(trackName) {
        const track = this.tracks[trackName];

        for (let i in track.parts) {
            let frequencies = this._parse(track.parts[i], track.bpm);
            this._loop(frequencies);
        }
    };

    TM.prototype._parse = function _parse(trackPart, bpm) {
        const header = trackPart.match(HEADER_STRUCTURE);
        const instrument = header[1];
        const tempo = header[2];

        const frequencies = [];
        let note;

        while ((note = NOTE_STRUCTURE.exec(trackPart))) {
            let name = note[1];
            let octave = note[2];
            let length = note[3];

            frequencies.push({
                length: this._getFreqLength(length, bpm),
                hz: this._convertToFrequency(name, octave, length)
            });
        }

        return frequencies;
    };

    TM.prototype._getFreqLength = function _getFreqLength(length, bpm) {
        const crotchetsPerSecond = bpm / 60;
        return parseInt(length) / crotchetsPerSecond / CROTCHETS_PER_BAR;
    }

    TM.prototype._convertToFrequency = function _convertToFrequency(name, octave, length) {
        const baseFrequency = zeroNotes.get(name);
        return baseFrequency * Math.pow(TWELTH_ROOT_OF_TWO, SEMITONES_PER_OCTAVE * octave);
    };

    TM.prototype._loop = function _loop(frequencies) {
        const playPromise = frequencies.reduce((promise, freq) => promise.then(() => this._playFreq(freq)), Promise.resolve());

        playPromise.then(() => this._loop(frequencies));
    };

    TM.prototype._playFreq = function _playFreq(freq) {
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
            oscillator.stop(this.audioContext.currentTime + freq.length);
        });
    };

    this.TM = TM;
}(this));