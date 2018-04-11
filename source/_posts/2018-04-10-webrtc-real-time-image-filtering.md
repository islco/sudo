---
title: WebRTC and Real-Time Image Filtering
author: Scott Donaldson
description:
---

In July 2017, WebRTC (Real-Time Communication) came to Safari on iOS, a move that greatly expanded the audience for media-driven mobile web applications. With WebRTC, a browser can not only gain access to media from a user’s microphone or camera, but to _streams_ of media. It means the difference between still photos and real-time video playback.

You can often find WebRTC powering person-to-person communication apps like Google Hangouts or Skype. But in this post, it’ll be a tool for person-to-algorithm communication — specifically, real-time image filtering algorithms, like in this demo:

<iframe height='425' scrolling='no' title='Real-time image filtering with WebRTC + WebGL' src='//codepen.io/scottdonaldson/embed/VXgEby/?height=425&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;' allow="camera *;">
</iframe>

We first started working with WebRTC-driven camera access in a project for [Doritos](https://isl.co/case-studies/doritos-blaze-mobile-experience/). In this app, after allowing camera access, a user sees their camera feed, passed through a ‘thermal’ filter that only shows shades of purple, orange, and yellow. The process sounds intuitive and seamless — getting access to the camera and displaying the feed passed through an image filter — but there are several different web APIs that have to ‘talk to’ each other in order to make it work. So it’s helpful to break down the process into its parts and see how to put them all together!

The key components of filtering a real-time camera/video feed include:
1. The video stream
2. A `<video>` element
3. A buffer canvas
4. WebGL fragment shaders
5. An output canvas

Number 5 is the only piece that’s actually shown to the user. Just like a water faucet or an electrical outlet, it’s useless without infrastructure and a source. Starting at that source, let’s take a closer look at all of these components.

{% asset_img flow.png 'Video stream to video element to buffer canvas to WebGL fragment shaders to an output canvas!' %}

## 1. The video stream

The WebRTC part of this story starts and ends here. A key function, `getUserMedia`, when called, displays a prompt to the user to allow camera access (or not). If the user denies access, there’s nothing we can do about it. But if they allow it, a callback function will run, containing the MediaStream for the user’s camera. (A MediaStream is a web API interface, separate from WebRTC, that lets developers work with streaming audio and/or video).

Some sample JavaScript code to request access to the user’s camera and run a successful callback might look like:

```js
window.navigator.mediaDevices.getUserMedia({
  audio: false,
  facingMode: ‘user’ 	// or ‘environment’
}).then(function success(stream) {
  // this function runs when the user allows access
}).catch(function error() {
  // this function runs when the user blocks access,
  // or if there was an error
});
```

One part of this that I’m deliberately glossing over is browser fallbacks and device support. As of this writing, Safari on iOS has supported `getUserMedia` for less than a year, and many browsers/devices require vendor prefixes or fallbacks. The WebRTC team provides a library, `adapter.js`, that abstracts away a lot of these differences.

## 2. A <video\> element

Now, assuming the user gave the go-ahead, we’ve got a MediaStream object that can show us what the camera sees! But at the moment, it’s not attached to anything (again, it’s helpful to think of a real stream — it’s unwieldy on its own; you need something to either put it in or pass it through). Fortunately, we can do that simply with an HTML `<video>` element. If we leave it visible on the page, then it will show the live camera feed to the user. However, in this case, we’ll hide it, since there’s more we want to do with it.

Either way, more Javascript is needed to attach the MediaStream to the `<video>` element. This code could run inside the above callback function.

```js
const video = document.getElementById(‘video’);
video.srcObject = stream;
video.play();
```

Regardless of how or where the JS references the `<video>` element, it’s important that the `playsinline` attribute is present on it (i.e. `<video playsinline></video>`). Without this, your code won’t work in iOS, since those devices typically don’t allow video to autoplay (further reading).

Now that we have a reference to the `<video>` in our code, we’ll continue this ‘hot potato’ strategy, and pass it along to…

## 3. A buffer canvas

A buffer is a place to store some data without (yet) processing or acting on it. In this case, our data is the MediaStream being played through the `<video>` element. Unfortunately, we’re still not ready to pass it through an image filter, because it isn’t actually an image yet! How do we get from a `<video>` to an image?

Think of a reel of film, like in an old-school movie projector. It’s made up of thousands of individual frames which, when played quickly in sequence, give the illusion of motion. We take an almost identical approach here, using digital technology to simulate a real-time video.

First, in our JavaScript, we set up a buffer canvas. We then create a function called a ‘render loop,’ which, after we call it once, will continue calling itself as often as it can. That looks something like this:

```js
const buffer = document.createElement(‘canvas’);

function render() {
  buffer.getContext(‘2d’).drawImage(video, 0, 0);
  window.requestAnimationFrame(render);
}

render();
```

Within the render function, we get a reference to the buffer’s CanvasRenderingContext2D, and draw the `<video>` (as an image) to it. Every time this is called, this essentially shows a ‘screenshot’ of the video. Done quickly enough, it’s almost indistinguishable from the video itself.

`requestAnimationFrame` is like `setTimeout`, in that it calls the function passed to it. It differs from `setTimeout` in that you don’t tell it when to call the function; the browser knows to wait until the next available frame to call the function (this can help in determining the performance of your app — if it takes a long time, you should try to somehow reduce the number of calculations your code is performing).

## 4. + 5. WebGL fragment shaders and an output canvas

The last two steps really happen together, not one after another, so that means we’re almost there!

Having transformed the MediaStream into something that we can treat as if it were an image, let’s now put a filter on it. It’s technically possible to do this step with JavaScript and the native `<canvas>` API, but in 2018 CPUs aren’t fast enough (this would show the filtered camera stream moving _v e e e e r y s l o o o w l y_). So we need to reach a little lower and use WebGL (Graphics Library), which, by running on the GPU, can perform the calculations fast enough to keep up with the video frames running by.

WebGL requires a lot of tedious setup in order to run, so I’ll make use of Patricio Gonzalez Vivo’s `GlslCanvas` library. `GlslCanvas` also needs a `<canvas>` element on the page to draw to — this will be our output canvas! Let’s get a reference to it in our JavaScript.

```js
const GlslCanvas = require(‘glsl-canvas’);
const canvas = new GlslCanvas(document.getElementById(‘canvas’));
```

Next, we load our filter, which lives as a WebGL fragment shader. This is a piece of code in GLSL (GL shading language, a language distantly related to JavaScript).

The simplest fragment shader might look something like this:

```c
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
```

The `main` function gets called for every pixel on the canvas. `gl_FragColor` is a special global variable that sets the color of the pixel in question — in this case, making it bright red (`vec4` represents the red, green, blue, and alpha/transparency channels of the pixel, ranging between 0 and 1). But womp womp, GLSL and JavaScript can’t ‘talk’ directly with each other. As a workaround, the GLSL shader code can be written as a multi-line string and loaded up:

```js
const vertexShader = `
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;
canvas.load(vertexShader);
```

Since we have the buffer canvas (which at any given moment looks like a still from the video stream), we can also load that into the fragment shader. To do that, we export it as a data URL, a way of encoding image data, and set it as a ‘uniform,’ a special global variable in GLSL.

Inside the render loop function, we need to add:

```js
const dataURL = buffer.toDataURL();
canvas.setUniform(‘u_texture’, dataURL);
```

This allows us to reference `u_texture` inside the fragment shader. So every pixel on our canvas should now be able to get the color from the corresponding pixel coming from the buffer canvas! With a few assists from `glslCanvas`, the code for that looks like:

```c
uniform sampler_2D u_texture;
uniform vec2 u_resolution;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = texture2D(u_texture, st).rgb;

  gl_FragColor = vec4(color, 1.0);
}
```

It works! But right now we’re just doing a lot of extra work to show the camera stream. With a minor adjustment to the last line of the `main` function, we can change this into a blue-tinted filter:

```c
uniform sampler_2D u_texture;
uniform vec2 u_resolution;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = texture2D(u_texture, st).rgb;

  gl_FragColor = vec4(vec3(0.0, 0.0, color.b), 1.0);
}
```

From this point on, the limits are more creative than technical! `GlslCanvas` provides additional global variables, `u_mouse` and `u_time`, that refer to the user's mouse position and the number of seconds that have elapsed since it loaded, which provide ways of incorporating user interactivity and animations into the image filters. That said, writing WebGL shaders is pretty different from visuals done in CSS, SVG, or native `<canvas>` &mdash; what we've covered in this post is just the tip of the iceberg.

## Further Reading:

- [`getUserMedia` documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [`<video>` policies for iOS/Webkit](https://webkit.org/blog/6784/new-video-policies-for-ios/)
- [The Book of Shaders](https://thebookofshaders.com/) &mdash; an interactive "step-by-step guide through the abstract and complex universe of Fragment Shaders" (by the creator of `GlslCanvas`, [Patricio Gonzalez](https://twitter.com/patriciogv) Vivo, and Deep Lab/SfPC's [Jen Lowe](https://twitter.com/_jenlowe_)).
