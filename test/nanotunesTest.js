'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

describe('NanoTunes', function () {
    stubAudioContext();

    /* TODO: support CommonJS. Current
        * version attaches to executing
        * environment's global. */
    require('../nanotunes');
    const NT = global.NT;

    describe('the _parseInstrument method', function () {
        it('should parse the three-letter instrument name from an individual track part', function () {
            const trackPart = 'GTRA44B44';
            const expectedHeader = 'GTR';
            const actualHeader = NT.prototype._parseInstrument(trackPart);

            expect(actualHeader).to.equal(expectedHeader);
        });
    });

    describe('the _getFreqLength method', function () {
        it('should return a length, in seconds, for which a note\'s duration should be played', function () {
            const bpm = 120;
            const length = 4 // a crotchet
            const expectedLength = 0.5;
            const actualLength = NT.prototype._getFreqLength(length, bpm);

            expect(actualLength).to.equal(expectedLength);
        });

        it('should support the longest note duration that is currently supported', function () {
            const bpm = 240;
            const length = 16 // a crotchet
            const expectedLength = 1;
            const actualLength = NT.prototype._getFreqLength(length, bpm);

            expect(actualLength).to.equal(expectedLength);
        });
    });

    /* I'll eventually write some functional/regression tests to ensure this
     * produces the expected values for a range of notes */
    describe('the _convertToFrequencyMethod', function () {
        it('should convert a note to Hz', function () {
            const name = 'F';
            const octave = 5;
            const expectedFrequency = 698.5599999883178;
            const actualFrequency = NT.prototype._convertToFrequency(name, octave);

            expect(actualFrequency).to.equal(expectedFrequency);
        });

        it('should support sharp notes', function () {
            const name = 'D#';
            const octave = 2;
            const expectedFrequency = 77.79999999947958;
            const actualFrequency = NT.prototype._convertToFrequency(name, octave);

            expect(actualFrequency).to.equal(expectedFrequency);
        });

        it('should convert any rest note to 0 Hz', function () {
            const name = 'X';
            const octave = 9;
            const expectedFrequency = 0;
            const actualFrequency = NT.prototype._convertToFrequency(name, octave);

            expect(actualFrequency).to.equal(expectedFrequency);
        });
    });
});

function stubAudioContext() {
    const Ctx = global.AudioContext = function StubAudioContext() {
        this.currentTime = 0;
        this.destination = createStubAudioNode();
    };

    Ctx.prototype.createOscillator = function createOscillator() {};
    Ctx.prototype.createGain = function createGain() {};
    Ctx.prototype.createStereoPanner = function createStereoPanner() {};
}

function createStubAudioNode(...audioParams) {
    const props = {
        connect() {}
    };

    for (let param of audioParams) {
        props[param] = createStubAudioNode();
    }

    return props;
}

function createStubAudioParam() {
    return {
        value: 0,
        setValueAtTime() {}
    };
}