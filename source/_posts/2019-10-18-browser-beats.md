---
title: "Introducing Browser Beats"
author: Brittany Miltenberger
description: Creating interactive music in the browser
---

<script src="https://unpkg.com/tone"></script>
<script src="{% asset_path 'beats.js' %}"></script>
<script>
// Turn off Browser Beats on page leave
// window.onunload = function() {
//   console.log("Stop Browser Beats);
// };
</script>

_Note: This post is not intended as a step-by-step tutorial, but rather as documentation and insight into our approach in creating interactive music in the browser._

## What if the music you listened to automatically matched your mood?

---

You know those chill lo-fi study beats on Spotify? What about the playlists labeled "Jazz for Study" or "Music for Concentration." There are thousands of songs dedicated to focus, accounting for billions of streams. But think – how many times have you skipped a track, or sought a different playlist entirely, because the song's energy didn't match the task at hand.

If you're reading a long editorial article or academic paper – or perhaps you're pausing to consider the next sentence you'll write – you might want something lighter, easier on the ears; something bordering on white noise, providing the audio you need without impeding your concentration.

If you're doing something more active like writing or coding, you might want something upbeat; something that matches your energy and drives you forward as you type away.

Browser Beats is a JavaScript web application that utilizes the [Tone.js](https://tonejs.github.io/) library, [Ableton Live](https://www.ableton.com/en/live/) samples, and [DOM Events](https://developer.mozilla.org/en-US/docs/Web/Events) to generate unique sounds with the intention of complementing user activity in the browser.

Pause on a page to read, you hear low frequency, major key base lines. Scroll up or down and hear higher frequency synths. Type slowly and Browser Beats automatically layers a four-on-the-floor beat atop the synths. Type quickly to get one final layer – high-hat eighth notes that add a sense of speed and pace. **Give it a try in the text box below.**

Also try copying and pasting for a little easter egg :)

<textarea style="height: 200px; width: 100%;"></textarea>

## Part 1: Tiered Approach

**“How can we analyze user activity in a meaningful way?”** was a fundamental question we had to ask when building Browser Beats. We arrived at a tiered system approach where user activity can be differentiated into three different modes.

- Tier 0: Reading Mode
- Tier 1: Productivity Mode
- Tier 2: Hyper Productivity mode

A user advances up and down tiers based on their average actions per minute (APM). APM is calculated based on keydown and click events. Browser Beats also listens for additional one-off mouse (scroll) and keyboard (copy, paste) events.

```js
runtime.on("event", function({ event, APM, type }) {
  type === "APM" ? handleMessageAPM(APM) : handleMessageOneOff(type, event);
});

const handleMessageAPM = APM => {
  controller.processMessage(APM);
};

const handleMessageOneOff = (type, event) => {
  makeOneOffSound(type, event);
};
```

The one-off sounds are local .mp3 and .wav files played back via the [HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement) interface.

```js
const copy = new Audio("./sound_files/copy-sound.mp3");
const paste = new Audio("./sound_files/paste-sound.mp3");
const scroll = new Audio("./sound_files/scroll-sound.wav");
```

```js
const makeOneOffSound = (type, event) => {
  if (type === "copy") {
    copy.play();
  }

  if (type === "paste") {
    paste.play();
  }

  if (type === "scroll") {
    scroll.play();
  }
};
```

Brower Beats handles the tiers with Object-Oriented programming taking a class-based approach.

```js
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
```

## Part 2: Generating the beats

Based on current Actions per minute, Browser Beats will then decide what beat to play. When exploring different approaches for sounds and beat construction we arrived at a [step sequencer](<https://en.wikipedia.org/wiki/Music_sequencer#Step_sequencer_(step_recording_mode)>) composition approach. Step sequencers allow for generation of beats by cycling through a repeated number of steps, where at each step, a sound is either on or off. Furthermore, sequencers allow for the control of how many steps exist and the speed at which the sequencer loops through these steps.

_Building out a simple drum beat with Ableton Live's Step Sequencer (16 steps)_
![alt text](./images/4onFloorAbleton.png "Ableton Live Step Sequencer")

Browser Beats makes use of [Tone.js](https://tonejs.github.io/docs/13.8.25/Loop) library’s `Tone.Loop` which creates a looped callback `song` at the specified interval of `"16n"`.

```js
let counter = 0;
loopBeat = new Tone.Loop(song, "16n").start(0);

function song(time) {
  if (counter % 2 === 0) {
    hihatshort.triggerSound();
  }

  if (counter % 4 === 0) {
    kick.triggerSound();
  }

  if (counter % 8 === 0) {
    snare.triggerSound();
  }

  counter = (counter + 1) % 16;
}
```

With this approach, everytime the counter matches a certain condition, the sound will play. We set up the Browser Beats player with an Object-Oriented approach where we create a new `Tone.Player` for each unqiue sound in our beat. To read more about buffering see [Tone.js API](https://tonejs.github.io/docs/13.8.25/Buffer) documentation.

```js
const audioBuffers = {
  kick: new Tone.Buffer("./sound_files/kick.wav"),
  snare: new Tone.Buffer("./sound_files/snare.wav"),
  hihatshort: new Tone.Buffer("./sound_files/hihat-short.wav")
};

function BBPlayer(audioFile) {
  this.player = new Tone.Player({ retrigger: true });
  this.player.buffer = audioBuffers[audioFile];
  this.triggerSound = function() {
    if (this.player.buffer.loaded) this.player.start();
  };
}

// Initialize audio players
const kick = new BBPlayer("kick");
const snare = new BBPlayer("snare");
const hihatshort = new BBPlayer("hihatshort");
```

## Part 3: Bringing it all together

We now have two separate pieces to bring together &mdash; **our tiered actions per minute** and our **looped beat**.

We follow a similar conditional based approach as we did in our looping beat construction. At a set interval, Browser Beats conditionally checks the value of the current tier. Based on that value, our audio player will either connect or disconnect from our Tone.js [master output](https://tonejs.github.io/docs/13.8.25/Master).

```js
const thresholds = [100, 200, 800];
const controller = new TierController(thresholds);

window.setInterval(() => {
  const avgAPM = controller.getAverageAPM();
  let tier = controller.getTier();

  // Reading Mode
  if (tier === 0) {
    ambientSynth1.player.toMaster();
    ambientSynth2.player.toMaster();
    ambientSynth3.player.toMaster();
  }

  // Productivity Mode
  if (tier === 1) {
    kick.player.toMaster();
    snare.player.toMaster();

    hihatshort.player.disconnect();
  }

  // Hyper Productivity mode
  if (tier >= 2) {
    hihatshort.player.toMaster();
  }
}, 1000);
```

## Additional Resources

We took a sample based approach with our audio, utilizing .mp3 and .wav files. The Tone.js library has much, much more to offer regarding audio synthesis and sound manipulation. Below are some excellent beginner references if you’re curious to play around with this library.

- [Browser Noise: Web Audio Tutorial 15 (Introduction to Tone.js)](https://www.youtube.com/watch?v=8u1aQdG5Nrk)
- [Tone.js & CodePen Part 01 - Making Music with a Web Browser](https://www.youtube.com/watch?v=0uXDdTyYBYQ)
