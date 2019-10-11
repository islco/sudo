function slice(array, start, end) {
  let length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  start = start == null ? 0 : start;
  end = end === undefined ? length : end;

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : (end - start) >>> 0;
  start >>>= 0;

  let index = -1;
  const result = new Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

function takeRight(array, n = 1) {
  const length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  n = length - n;
  return slice(array, n < 0 ? 0 : n, length);
}

class TierController {
  constructor(thresholds) {
    this.kAPM = [0];
    this.mAPM = [0];
    this.tAPM = [0];
    this.tier = 0;
    this.thresholds = thresholds;
  }

  processMessage(APM) {
    this.pushAPM(this.kAPM, APM.kAPM);
    this.pushAPM(this.mAPM, APM.mAPM);
    this.pushAPM(this.tAPM, APM.kAPM + APM.mAPM);
    const tier = this.calculateTier();
    this.setTier(tier);
  }

  pushAPM(arr, newAPMValue) {
    if (arr.length > 9) arr.shift();
    arr.push(newAPMValue);
  }

  calculateTier() {
    for (let i = 0; i < this.thresholds.length; i++) {
      if (this.getAverageAPM() < this.thresholds[i]) {
        return i;
      }
    }
  }

  getAverageAPM() {
    const set = takeRight(this.tAPM, 5);
    const trendLength = set.length;
    const sum = set.reduce(sumReducer);
    return parseInt(sum / trendLength, 10);
  }

  getTier() {
    return this.tier;
  }

  setTier(tier) {
    this.tier = tier;
  }
}

const sumReducer = (accum, current) => accum + current;

class PubSub {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    this.events[event] = callback;
  }

  send(event, data) {
    if (this.events[event]) this.events[event](data);
  }
}

const runtime = new PubSub();

/* - - - - - - - - - - - - - - - - - - TONE MUSIC -- refactor to add to new JS file  - - - - - - - - - - - - - - - - - - */
const lazerOneOff = new Audio(
  "http://audiosoundclips.com/wp-content/uploads/2014/02/DJ-Lazer-2.mp3"
);

const slowScroll = new Audio(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/f_maj7_03_ambient_swells.wav"
);

const fastScroll = new Audio(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/c_maj7_04_ambient_swells.wav"
);

lazerOneOff.volume = 0.2;

// Initialize audio samples in a buffer
const audioBuffers = {
  c_maj7_01_swell: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/c_maj7_01_ambient_swells.wav"
  ),
  c_maj7_02_swell: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/c_maj7_02_ambient_swells.wav"
  ),
  c_maj7_03_swell: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/c_maj7_03_ambient_swells.wav"
  ),
  c_maj7_04_swell: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/c_maj7_04_ambient_swells.wav"
  ),
  f_maj07_01_swell: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/f_maj7_01_ambient_swells.wav"
  ),
  f_maj07_02_swell: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/f_maj7_02_ambient_swells.wav"
  ),
  f_maj07_03_swell: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/f_maj7_03_ambient_swells.wav"
  ),
  f_maj07_04_swell: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/f_maj7_04_ambient_swells.wav"
  ),
  kick: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/kick.wav"
  ),
  snare: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/snare.wav"
  ),
  hihatshort: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/hihat-short.wav"
  ),
  hihatlong: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/hihat-long.wav"
  ),
  ride: new Tone.Buffer(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310575/ride.wav"
  )
};

// Custom BrowserBeats Object
function BBPlayer(audioFile) {
  this.player = new Tone.Player({ retrigger: true });
  this.player.buffer = audioBuffers[audioFile];
  this.triggerSound = function() {
    if (this.player.buffer.loaded) this.player.start();
  };
}

// Initialize audio players
//const snare = new BBPlayer('snareDrum')
//snare.player.volume.value = -20

const cMaj701Swell = new BBPlayer("c_maj7_01_swell");
const cMaj702Swell = new BBPlayer("c_maj7_02_swell");
const cMaj703Swell = new BBPlayer("c_maj7_03_swell");
const cMaj704Swell = new BBPlayer("c_maj7_04_swell");

const fMaj701Swell = new BBPlayer("f_maj07_01_swell");
const fMaj702Swell = new BBPlayer("f_maj07_02_swell");
const fMaj703Swell = new BBPlayer("f_maj07_03_swell");

const kick = new BBPlayer("kick");
const snare = new BBPlayer("snare");
const hihatshort = new BBPlayer("hihatshort");
const hihatlong = new BBPlayer("hihatlong");
const ride = new BBPlayer("ride");

// Global variables to initialze counter and looped beat
let counter = 0;
let loopBeat;

/* Tone.js Instrument setup */
let bassSynth = new Tone.MembraneSynth();
bassSynth.volume.value = -14;
let cymbalSynth = new Tone.MetalSynth({
  frequency: 250,
  envelope: {
    attack: 0.001,
    decay: 0.1,
    release: 0.01
  },
  harmonicity: 3.1,
  modulationIndex: 16,
  resonance: 8000,
  octaves: 0.5
});
cymbalSynth.volume.value = -20;
/* End  Tone.js Instrument setup */

loopBeat = new Tone.Loop(song, "16n").start(0);

function song(time) {
  if (counter === 0) {
    kick.triggerSound();
    hihatshort.triggerSound();
    hihatlong.triggerSound();
    fMaj701Swell.triggerSound();
  }

  if (counter === 4) {
    hihatshort.triggerSound();
  }

  if (counter === 8) {
    hihatshort.triggerSound();
    snare.triggerSound();
    fMaj702Swell.triggerSound();
  }

  if (counter === 12) {
    hihatshort.triggerSound();
  }

  if (counter === 14) {
    kick.triggerSound();
  }

  if (counter === 16) {
    kick.triggerSound();
    fMaj703Swell.triggerSound();
  }

  if (
    counter === 17 ||
    counter === 18 ||
    counter === 19 ||
    counter === 20 ||
    counter === 21 ||
    counter === 22 ||
    counter === 23
  ) {
    hihatshort.triggerSound();
  }

  if (counter === 24) {
    hihatshort.triggerSound();
    snare.triggerSound();
  }

  if (counter === 26) {
    snare.triggerSound();
  }

  if (counter === 28) {
    hihatshort.triggerSound();
  }

  if (counter === 29) {
    ride.triggerSound();
  }

  if (counter === 32) {
    hihatshort.triggerSound();
    kick.triggerSound();
  }

  if (counter === 36) {
    hihatshort.triggerSound();
  }

  if (counter === 40) {
    hihatshort.triggerSound();
    snare.triggerSound();
  }

  if (counter === 42) {
    kick.triggerSound();
  }

  if (counter === 44) {
    hihatshort.triggerSound();
  }

  if (counter === 45) {
    kick.triggerSound();
  }

  if (counter === 48) {
    hihatshort.triggerSound();
    kick.triggerSound();
  }

  if (counter === 51 || counter === 52 || counter === 54 || counter === 55) {
    hihatshort.triggerSound();
  }

  if (counter === 56) {
    snare.triggerSound();
  }

  if (counter === 57) {
    hihatshort.triggerSound();
  }

  if (counter === 58) {
    snare.triggerSound();
  }

  if (counter === 59 || counter === 60) {
    hihatshort.triggerSound();
  }

  if (counter === 61) {
    ride.triggerSound();
  }

  if (counter === 62 || counter === 63) {
    hihatshort.triggerSound();
  }

  // if (counter % 16 === 0) {
  //   fMaj701Swell.triggerSound()
  // }

  counter = (counter + 1) % 64;
}

function masterStart() {
  Tone.Transport.start().bpm.value = 50;
}

function masterStop() {
  Tone.Transport.stop();
}

function increaseTempo() {
  Tone.Transport.bpm.value += 20;
}

function decreaseTempo() {
  Tone.Transport.bpm.value -= 20;
}

function toneInstrumentOn(instrument) {
  instrument.toMaster();
}

function toneInstrumentOff(instrument) {
  instrument.disconnect();
}

masterStart();
/* - - - - - - - - - - - - - - - - - - END TONE MUSIC -- refactor to add to new JS file  - - - - - - - - - - - - - - - - - - */

// Controller Initialization

const thresholds = [100, 200, 500, 1000, 2000];
const controller = new TierController(thresholds);

window.setInterval(() => {
  const avgAPM = controller.getAverageAPM();
  const tier = controller.getTier();
  console.log({ avgAPM, tier });

  if (tier === 0) {
    Tone.Transport.bpm.value = 80;

    toneInstrumentOn(fMaj701Swell.player);
    toneInstrumentOn(fMaj702Swell.player);
    toneInstrumentOn(fMaj703Swell.player);
    // toneInstrumentOn(snare.player)
    // toneInstrumentOn(hihatshort.player)
    // toneInstrumentOn(hihatshort.player)
    // toneInstrumentOn(ride.player)

    // toneInstrumentOn(cMaj701Swell.player)
    // toneInstrumentOn(cMaj702Swell.player)
    // toneInstrumentOn(cMaj703Swell.player)
    // toneInstrumentOn(cMaj704Swell.player)
    // toneInstrumentOff(bassSynth)
    // toneInstrumentOff(snare.player)
    // toneInstrumentOff(cymbalSynth)

    // TURN OFF
    toneInstrumentOff(kick.player);
    toneInstrumentOff(ride.player);
    toneInstrumentOff(hihatlong.player);
    toneInstrumentOff(hihatshort.player);
    toneInstrumentOff(snare.player);
  }

  if (tier === 1) {
    Tone.Transport.bpm.value = 100;
    toneInstrumentOn(kick.player);

    toneInstrumentOn(ride.player);
    toneInstrumentOn(snare.player);
    toneInstrumentOn(hihatshort.player);

    // TURN OFF
    toneInstrumentOff(kick.player);
  }

  if (tier >= 2) {
    Tone.Transport.bpm.value = 130;
    toneInstrumentOn(kick.player);
    toneInstrumentOn(hihatshort.player);
    toneInstrumentOn(hihatlong.player);
  }
}, 1000);

// Handle Messages from Content Script

runtime.on("event", function({ event, APM, type }) {
  type === "APM" ? handleMessageAPM(APM) : handleMessageOneOff(type, event);
});

const handleMessageAPM = APM => {
  controller.processMessage(APM);
};

const handleMessageOneOff = (type, event) => {
  makeOneOffSound(type, event);
};

// Make music here!

const makeOneOffSound = (type, event) => {
  if (type === "paste" || type === "copy") {
    // play some sound
    lazerOneOff.play();
  }

  if (type === "scroll") {
    fastScroll.play();
  }
};

// use controller.getTier()
// use controller.getAverageAPM()

const interval = 1000;
let ms = 0;
let keyboard_actions = 0;
let mouse_actions = 0;

const processAPM = () => {
  ms += interval;
  const minutes = ms / 60000;
  const APM = {
    kAPM: parseInt(keyboard_actions / minutes, 10),
    mAPM: parseInt(mouse_actions / minutes, 10)
  };
  runtime.send("event", { type: "APM", APM });
};

const clearCounters = () => {
  ms = 0;
  keyboard_actions = 0;
  mouse_actions = 0;
};

window.setInterval(processAPM, interval);
window.setInterval(() => {
  clearCounters();
}, interval * 10 - 500);

// APM Listeners

const handlePress = e => {
  e.type === "click" ? mouse_actions++ : keyboard_actions++;
};

window.addEventListener("keydown", handlePress);
window.addEventListener("click", handlePress);

// One-Off Listeners

const handleOneOff = event => {
  const type = event.type;
  runtime.send("event", { type, event });
};

window.addEventListener("copy", handleOneOff);
window.addEventListener("paste", handleOneOff);
window.addEventListener("scroll", handleOneOff);
