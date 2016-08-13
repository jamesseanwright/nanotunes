(function () {
    'use strict';

    var HEADER_STRUCTURE = /^([A-Z]{3})/;
    var NOTE_STRUCTURE = /([A-GX]#?)([1-8])([1-9]{1,2})/g;
    var TWELTH_ROOT_OF_TWO = 1.059463094359;
    var SEMITONES_PER_OCTAVE = 12;
    var CROTCHETS_PER_BAR = 4;

    var zeroNotes = new Map([['C', 16.35], ['C#', 17.32], ['D', 18.35], ['D#', 19.45], ['E', 20.6], ['F', 21.83], ['F#', 23.12], ['G', 24.5], ['G#', 25.96], ['A', 27.5], ['A#', 29.14], ['B', 30.87], ['X', 0]]);

    function TM(bpm, instruments, tracks) {
        this.audioContext = new AudioContext();
        this.tracks = new Map(tracks);
        this.crotchetsPerSecond = bpm / 60;
    }

    TM.prototype.play = function play(trackName) {
        var trackParts = this.tracks.get(trackName);

        for (var i in trackParts) {
            var frequencies = this._parse(trackParts[i]);
            this._loop(frequencies);
        }
    };

    TM.prototype._parse = function _parse(track) {
        var header = track.match(HEADER_STRUCTURE);
        var instrument = header[1];
        var tempo = header[2];

        var frequencies = [];
        var note = void 0;

        while (note = NOTE_STRUCTURE.exec(track)) {
            var name = note[1];
            var octave = note[2];
            var length = note[3];

            frequencies.push({
                length,
                hz: this._convertToFrequency(name, octave, length)
            });
        }

        return frequencies;
    };

    TM.prototype._convertToFrequency = function _convertToFrequency(name, octave, length) {
        var baseFrequency = zeroNotes.get(name);
        return baseFrequency * Math.pow(TWELTH_ROOT_OF_TWO, SEMITONES_PER_OCTAVE * octave);
    };

    TM.prototype._loop = function _loop(frequencies) {
        var _this = this;

        var playPromise = frequencies.reduce(function (promise, freq) {
            return promise.then(function () {
                return _this._playFreq(freq);
            });
        }, Promise.resolve());

        playPromise.then(function () {
            return _this._loop(frequencies);
        });
    };

    TM.prototype._playFreq = function _playFreq(freq) {
        var _this2 = this;

        return new Promise(function (resolve) {
            var oscillator = _this2.audioContext.createOscillator();
            var gain = _this2.audioContext.createGain();

            oscillator.type = 'square';
            oscillator.frequency.value = freq.hz;

            gain.gain.value = 0.3;

            oscillator.connect(gain);
            gain.connect(_this2.audioContext.destination);

            oscillator.addEventListener('ended', resolve);
            oscillator.start(0);
            oscillator.stop(_this2.audioContext.currentTime + freq.length / _this2.crotchetsPerSecond / CROTCHETS_PER_BAR);
        });
    };

    this.TM = TM;
})(this);
