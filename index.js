'use strict';

const HEADER_STRUCTURE = /^([A-Z]{3})/;
const NOTE_STRUCTURE = /([A-GX]#?)([1-8])([1-9]{1,2})/g;
const TWELTH_ROOT_OF_TWO = 1.059463094359;
const SEMITONES_PER_OCTAVE = 12;
const SEMIBREVES_PER_BAR = 1;
const BEATS_PER_MINUTE = 240;
const CROTCHETS_PER_SECOND = BEATS_PER_MINUTE / 60;
const CROTCHETS_PER_BAR = 4;

const zeroNotes = new Map([['C', 16.35], ['C#', 17.32], ['D', 18.35], ['D#', 19.45], ['E', 20.6], ['F', 21.83], ['F#', 23.12], ['G', 24.5], ['G#', 25.96], ['A', 27.5], ['A#', 29.14], ['B', 30.87], ['X', 0]]);

const tracks = [
    'GTRC44C44G44A44A#44A44G44E44',
    'BSSC24C24G14G14A#14A#14B14B14',
];

const audioContext = new AudioContext();

playButton.onclick = () => {
    for (let track of tracks) {
        parse(track);
    }
};

function parse(track) {
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
            hz: convertToFrequency({ name, octave, length })
        });
    }

    loop(frequencies);
}

function convertToFrequency({ name, octave, length }) {
    const baseFrequency = zeroNotes.get(name);
    return baseFrequency * Math.pow(TWELTH_ROOT_OF_TWO, SEMITONES_PER_OCTAVE * octave);
}

function loop(frequencies) {
    const playPromise = frequencies.reduce((promise, freq) => promise.then(() => play(freq)), Promise.resolve());

    playPromise.then(() => loop(frequencies));
}

function play(freq) {
    return new Promise(resolve => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.value = freq.hz;

        gain.gain.value = 0.3;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.addEventListener('ended', resolve);
        oscillator.start(0);
        oscillator.stop(audioContext.currentTime + freq.length / CROTCHETS_PER_SECOND / CROTCHETS_PER_BAR);
    });
}