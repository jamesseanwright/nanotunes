(function () {
    'use strict';

    var HEADER_STRUCTURE = /^([A-Z]{3})/;
    var NOTE_STRUCTURE = /([A-GX]#?)([1-8])([1-9]{1,2})/g;
    var TWELTH_ROOT_OF_TWO = 1.059463094359;
    var SEMITONES_PER_OCTAVE = 12;
    var CROTCHETS_PER_BAR = 4;

    var zeroNotes = new Map([['C', 16.35], ['C#', 17.32], ['D', 18.35], ['D#', 19.45], ['E', 20.6], ['F', 21.83], ['F#', 23.12], ['G', 24.5], ['G#', 25.96], ['A', 27.5], ['A#', 29.14], ['B', 30.87], ['X', 0]]);

    function TM(instruments, tracks) {
        this.audioContext = new AudioContext();
        this.instruments = instruments;
        this.tracks = tracks;
    }

    TM.prototype.play = function play(trackName) {
        var track = this.tracks[trackName];

        for (var i = 0; i < track.parts.length; i++) {
            var instrument = this.instruments[this._parseInstrument(track.parts[i])];
            var frequencies = this._parseFreqs(track.parts[i], track.bpm);
            var oscillator = this._createOscillator(instrument);
            this._loop(oscillator, frequencies);
        }
    };

    TM.prototype._parseInstrument = function _parseInstrument(trackPart) {
        var header = trackPart.match(HEADER_STRUCTURE);
        return header[1];
    };

    TM.prototype._parseFreqs = function _parseFreqs(trackPart, bpm) {
        var frequencies = [];
        var note = void 0;

        while (note = NOTE_STRUCTURE.exec(trackPart)) {
            var name = note[1];
            var octave = note[2];
            var length = note[3];

            frequencies.push({
                length: this._getFreqLength(length, bpm),
                hz: this._convertToFrequency(name, octave, length)
            });
        }

        return frequencies;
    };

    TM.prototype._getFreqLength = function _getFreqLength(length, bpm) {
        var crotchetsPerSecond = bpm / 60;
        return parseInt(length) / crotchetsPerSecond / CROTCHETS_PER_BAR;
    };

    TM.prototype._convertToFrequency = function _convertToFrequency(name, octave, length) {
        var baseFrequency = zeroNotes.get(name);
        return baseFrequency * Math.pow(TWELTH_ROOT_OF_TWO, SEMITONES_PER_OCTAVE * octave);
    };

    TM.prototype._createOscillator = function _createOscillator(instrument) {
        var oscillator = this.audioContext.createOscillator();

        oscillator.type = instrument.wave;
        oscillator.frequency.value = 0;

        var nextNode = this._applyGain(oscillator, instrument.gain);
        nextNode = this._applyPan(nextNode, instrument.pan);
        nextNode.connect(this.audioContext.destination);

        oscillator.start();

        return oscillator;
    };

    TM.prototype._loop = function _loop(oscillator, frequencies) {
        var _this = this;

        var nextTime = this.audioContext.currentTime;

        oscillator.addEventListener('ended', function () {
            return _this._loop(oscillator, frequencies);
        });

        for (var i = 0; i < frequencies.length; i++) {
            var frequency = frequencies[i];
            oscillator.frequency.setValueAtTime(frequencies[i].hz, nextTime);
            nextTime += frequency.length;

            var isEnded = i === frequencies.length - 1;

            if (isEnded) {
                oscillator.stop(nextTime);
            }
        }
    };

    TM.prototype._applyGain = function _applyGain(node, gain) {
        return this._applyEffect(node, gain, 'createGain', 'gain');
    };

    TM.prototype._applyPan = function _applyPan(node, pan) {
        return this._applyEffect(node, pan, 'createStereoPanner', 'pan');
    };

    TM.prototype._applyEffect = function _applyEffect(node, val, method, prop) {
        if (!val) {
            return node;
        }

        var nextNode = this.audioContext[method]();
        nextNode[prop].value = val;
        node.connect(nextNode);

        return nextNode;
    };

    this.TM = TM;
})(this);
