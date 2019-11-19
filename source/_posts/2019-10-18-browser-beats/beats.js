var loopBeat;
var handlePress;
var handleOneOff;

(function startTheBeat(browserBeatsVisited) {
  if (browserBeatsVisited) {
    return null;
  }

  function slice(array, start, end) {
    let len = array == null ? 0 : array.length;
    if (!len) {
      return [];
    }
    start = start == null ? 0 : start;
    end = end === undefined ? len : end;

    if (start < 0) {
      start = -start > len ? 0 : len + start;
    }
    end = end > len ? len : end;
    if (end < 0) {
      end += len;
    }
    len = start > end ? 0 : (end - start) >>> 0;
    start >>>= 0;

    let index = -1;
    const result = new Array(len);
    while (++index < len) {
      result[index] = array[index + start];
    }
    return result;
  }

  function takeRight(array, n = 1) {
    const len = array == null ? 0 : array.length;
    if (!len) {
      return [];
    }
    n = len - n;
    return slice(array, n < 0 ? 0 : n, len);
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

  const slowScroll = new Audio("./sound_files/f_maj7_03_ambient_swells.wav");

  const fastScroll = new Audio("./sound_files/c_maj7_04_ambient_swells.wav");

  const copy = new Audio("./sound_files/copynew.mp3");

  const paste = new Audio("./sound_files/pastenew.mp3");

  copy.volume = 0.1;
  paste.volume = 0.1;

  // Initialize audio samples in a buffer
  const audioBuffers = {
    c_maj7_01_swell: new Tone.Buffer(
      "./sound_files/c_maj7_01_ambient_swells.wav"
    ),
    c_maj7_02_swell: new Tone.Buffer(
      "./sound_files/c_maj7_02_ambient_swells.wav"
    ),
    c_maj7_03_swell: new Tone.Buffer(
      "./sound_files/c_maj7_03_ambient_swells.wav"
    ),
    c_maj7_04_swell: new Tone.Buffer(
      "./sound_files/c_maj7_04_ambient_swells.wav"
    ),
    f_maj07_01_swell: new Tone.Buffer(
      "./sound_files/f_maj7_01_ambient_swells.wav"
    ),
    f_maj07_02_swell: new Tone.Buffer(
      "./sound_files/f_maj7_02_ambient_swells.wav"
    ),
    f_maj07_03_swell: new Tone.Buffer(
      "./sound_files/f_maj7_03_ambient_swells.wav"
    ),
    f_maj07_04_swell: new Tone.Buffer(
      "./sound_files/f_maj7_04_ambient_swells.wav"
    ),
    kick: new Tone.Buffer("./sound_files/kick.wav"),
    snare: new Tone.Buffer("./sound_files/snare.wav"),
    hihatshort: new Tone.Buffer("./sound_files/hihat-short.wav"),
    hihatlong: new Tone.Buffer("./sound_files/hihat-long.wav"),
    ride: new Tone.Buffer("./sound_files/ride.wav")
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

  // NEW Set to master
  toneInstrumentOn(cMaj701Swell.player);
  toneInstrumentOn(cMaj702Swell.player);
  toneInstrumentOn(cMaj703Swell.player);
  toneInstrumentOn(cMaj704Swell.player);
  toneInstrumentOn(fMaj701Swell.player);
  toneInstrumentOn(fMaj702Swell.player);
  toneInstrumentOn(kick.player);
  toneInstrumentOn(snare.player);
  toneInstrumentOn(hihatshort.player);
  toneInstrumentOn(hihatlong.player);
  toneInstrumentOn(ride.player);

  kick.player.volume.value = -100;
  ride.player.volume.value = -100;
  snare.player.volume.value = -100;
  hihatshort.player.volume.value = -100;
  hihatlong.player.volume.value = -100;

  // Global variables to initialze counter and looped beat
  let counter = 0;
  let firstTimeThru = true;

  /* Tone.js Instrument setup - Currently not used */
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
  /* End  Tone.js Instrument setup - Currently not used */

  loopBeat = new Tone.Loop(song, "16n").start(0);

  function song(time) {
    if (counter % 2 === 0) {
      hihatshort.triggerSound();
    }

    if (counter % 2 !== 0) {
      // hihatlong.triggerSound();
    }

    if (
      counter === 0 ||
      counter === 6 ||
      counter === 8 ||
      counter === 16 ||
      counter === 22 ||
      counter === 26
    ) {
      kick.triggerSound();
    }

    if (counter === 0) {
      fMaj701Swell.triggerSound();
    }

    if (
      (counter === 4 || counter === 12 || counter === 20 || counter === 28) &&
      !firstTimeThru
    ) {
      snare.triggerSound();
    }

    if (counter === 8) {
      fMaj702Swell.triggerSound();
    }

    if (counter % 16 === 0) {
      fMaj703Swell.triggerSound();
      // hihatlong.triggerSound();
    }

    // counter = (counter + 1) % 64;
    firstTimeThru = false;
    counter = (counter + 1) % 32;
  }

  function masterStart() {
    Tone.Transport.start().bpm.value = 100;
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

  const thresholds = [100, 200, 800, 1000, 2000];

  const controller = new TierController(thresholds);

  let prevTier = 0;
  window.setInterval(() => {
    const avgAPM = controller.getAverageAPM();
    let tier = controller.getTier();

    // console.log({ avgAPM, tier });
    // console.log("prevTier", prevTier);

    if (prevTier !== tier && prevTier === 0) {
      // console.log("tier change!");
      // console.log("prevtier", prevTier);
      // console.log("tier", tier);
      Tone.Transport.stop();
      counter = 0;
      firstTimeThru = true;
      Tone.Transport.start();
      prevTier = tier;
    }

    if (tier === 0) {
      // toneInstrumentOn(fMaj701Swell.player);
      // toneInstrumentOn(fMaj702Swell.player);
      // toneInstrumentOn(fMaj703Swell.player);
      // TURN OFF
      // toneInstrumentOff(kick.player);
      // toneInstrumentOff(ride.player);
      // toneInstrumentOff(hihatlong.player);
      // toneInstrumentOff(hihatshort.player);
      // toneInstrumentOff(snare.player);
      kick.player.volume.value = -100;
      ride.player.volume.value = -100;
      hihatshort.player.volume.value = -100;

      hihatlong.player.volume.value = -100;
      snare.player.volume.value = -100;
      prevTier = 0;
    }

    if (tier === 1) {
      // toneInstrumentOn(kick.player);
      // toneInstrumentOn(ride.player);
      // toneInstrumentOn(snare.player);
      // toneInstrumentOn(hihatshort.player);
      kick.player.volume.value = 0;
      ride.player.volume.value = 0;

      snare.player.volume.value = 0;
      // TURN OFF
      hihatlong.player.volume.value = -100;
      hihatshort.player.volume.value = -100;
    }

    if (tier >= 2) {
      //   toneInstrumentOn(hihatshort.player);
      //   toneInstrumentOn(hihatlong.player);
      // }
      hihatlong.player.volume.value = 0;
      hihatshort.player.volume.value = 0;
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

  // One-Off Sounds
  const makeOneOffSound = (type, event) => {
    if (type === "copy") {
      copy.play();
    }

    if (type === "paste") {
      // play some sound
      paste.play();
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

  handlePress = e => {
    e.type === "click" ? mouse_actions++ : keyboard_actions++;
  };

  window.addEventListener("keydown", handlePress);
  window.addEventListener("click", handlePress);

  // One-Off Listeners

  handleOneOff = event => {
    const type = event.type;
    runtime.send("event", { type, event });
  };

  window.addEventListener("copy", handleOneOff);
  window.addEventListener("paste", handleOneOff);
  window.addEventListener("scroll", handleOneOff);
})(browserBeatsVisited);

// Global check for page visit
var browserBeatsVisited = true;
