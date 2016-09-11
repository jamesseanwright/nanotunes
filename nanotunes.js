(function () {
    'use strict';

    const HEADER_STRUCTURE = /^([A-Z]{3})/;
    const NOTE_STRUCTURE = /([A-GX]#?)([1-8])([1-9]{1,2})/g;
    const TWELTH_ROOT_OF_TWO = 1.059463094359;
    const SEMITONES_PER_OCTAVE = 12;
    const CROTCHETS_PER_BAR = 4;

    const zeroNotes = new Map([['C', 16.35], ['C#', 17.32], ['D', 18.35], ['D#', 19.45], ['E', 20.6], ['F', 21.83], ['F#', 23.12], ['G', 24.5], ['G#', 25.96], ['A', 27.5], ['A#', 29.14], ['B', 30.87], ['X', 0]]);

    function NT(instruments, tracks, audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || webkitAudioContext)();
        this.instruments = instruments;
        this.tracks = tracks;
        this.oscillators = [];
    }

    NT.prototype.play = function play(trackName) {
        this.stop();

        const track = this.tracks[trackName];
        const oscillators = new Array(track.parts.length);

        for (let i = 0; i < track.parts.length; i++) {
            let instrument = this.instruments[this._parseInstrument(track.parts[i])];
            let frequencies = this._parseFreqs(track.parts[i], track.bpm);
            oscillators[i] = this._createOscillator(instrument);
            this._enqueueFreqs(oscillators[i], frequencies, track.isLooping);
        }

        this.oscillators = oscillators;
    };

    NT.prototype.stop = function stop() {
        for (let i = 0; i < this.oscillators.length; i++) {
            this.oscillators[i].stop();
        }
    };

    NT.prototype._parseInstrument = function _parseInstrument(trackPart) {
        const header = trackPart.match(HEADER_STRUCTURE);
        return header[1];
    };

    NT.prototype._parseFreqs = function _parseFreqs(trackPart, bpm) {
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

    NT.prototype._getFreqLength = function _getFreqLength(length, bpm) {
        const crotchetsPerSecond = bpm / 60;
        return parseInt(length) / crotchetsPerSecond / CROTCHETS_PER_BAR;
    }

    NT.prototype._convertToFrequency = function _convertToFrequency(name, octave, length) {
        const baseFrequency = zeroNotes.get(name);
        return baseFrequency * Math.pow(TWELTH_ROOT_OF_TWO, SEMITONES_PER_OCTAVE * octave);
    };

    NT.prototype._createOscillator = function _createOscillator(instrument) {
        const oscillator = this.audioContext.createOscillator();

        oscillator.type = instrument.wave;
        oscillator.frequency.value = 0;

        let nextNode = this._applyGain(oscillator, instrument.gain);
        nextNode = this._applyPan(nextNode, instrument.pan);
        nextNode.connect(this.audioContext.destination);

        oscillator.start();

        return oscillator;
    };

    NT.prototype._enqueueFreqs = function _enqueueFreqs(oscillator, frequencies, isLooping) {
        let nextTime = 0;

        for (let i = 0; i < frequencies.length; i++) {
            let frequency = frequencies[i];
            oscillator.frequency.setValueAtTime(frequencies[i].hz, this.audioContext.currentTime + nextTime);
            nextTime += frequency.length;
        }

        setTimeout(() => {
            if (!isLooping) {
                this.stop();
                this.onStop && this.onStop();
                return;
            }

            this._enqueueFreqs(oscillator, frequencies, isLooping);
        }, Math.round(nextTime) * 1000);
    };

    NT.prototype._applyGain = function _applyGain(node, gain) {
        return this._applyEffect(node, gain, 'createGain', 'gain');
    };

    NT.prototype._applyPan = function _applyPan(node, pan) {
        return this._applyEffect(node, pan, 'createStereoPanner', 'pan');
    };

    NT.prototype._applyEffect = function _applyEffect(node, val, method, prop) {
        if (!val || !this.audioContext[method]) {
            return node;
        }

        const nextNode = this.audioContext[method]();
        nextNode[prop].value = val;
        node.connect(nextNode);

        return nextNode;
    };

    this.NT = NT;
}(this));