---
title: "Generative Design on the Web: SVG-Based Patterns"
author: Scott Donaldson
description: Using generative design extends our creative capabilities and lets us automatically generate beautiful, visually compelling patterns built with SVG.
---

In this article, we’ll talk about using generative design to produce graphic patterns (in SVG format). [Click here](#Extended-Demo) to skip directly to the demo, or [here](#Building-a-Generative-System) for a tutorial on the code behind it. Otherwise, read on to learn about what generative design is and why you might want to use it on the web!

{% asset_img patterns-anim.gif 'A variety of generative patterns created in SVG' %}

## What is Generative Design?

In a web project that uses graphic patterns for visual interest, it’s often well worth the effort to use a _generative design_ approach rather than working primarily manually with design artifacts. With generative design, a rule-based system (written in code) generates images automatically. A generative system can be written in JavaScript, JSX, Python, PHP, or almost any other programming language. An extensive set of CSS rules can also serve as the basis for generative design (see [Yuan Chuan’s CSS experiments](https://codepen.io/yuanchuan/)). No matter the implementation, a generative system takes in certain parameters such as height, width, color palette (etc.), and automatically produces a near-infinite number of variations on a base design.

The key aspect of generative design that differentiates it from typical visual or interactive design is the self-conscious encoding of rules and relationships over objects and artifacts. For a designer producing an image, the decision-making takes place in their mind, their eyes, and their hands. Manipulating shapes, paths, and patterns, they assess their work critically and refine it based on aesthetic value judgments and (often unconscious) rules of layout, hierarchy, repetition, and so on. They also operate based on a set of rules that’s particular to the work at hand — for example, the rules for a minimalist geometric design might include separating elements by ample white space, utilizing a rigid, underlying grid, and placing a cap on the number of elements visible on screen at any given time. By contrast, the rules for a contemporary, edgy design might include overlaying filtered photos, juxtaposing type styles, and using clashing colors.

To go from the process above to a generative system, the designer’s opinions and values (basically, the things that drive decision decisions) need to be translated into computations. The English phrase “separating elements by ample white space” might become a function that loops over data, and sets X and Y offsets based on a minimum distance threshold to the neighboring objects. “Using clashing colors” would likely operate on RGB or HSL values and return outputs based on minimum distances in [color space](https://en.wikipedia.org/wiki/Color_space). (In general, a lot of this type of process can be made easier by thinking spatially, or dimensionally!) In any case, basic programming, as well as math and geometry, are necessary skills to be able to encode generative design systems — but conversely, building such a system is a great way to remember that math is about much more than numbers, and that it can produce really beautiful, compelling visual imagery.

## Why Generative Design?

Generative design has a clear payoff in terms of process and efficiency. Suppose that numerous variations of an asset are used in different contexts (such as header images or page dividers) but use the same base rules. In a traditional process, if the visual design changes, updating the images across all these locations requires a visual designer to spend hours tediously editing files, re-export, and upload the new images. With generative design, it becomes a matter of editing the code that makes up the generative system, which can instantly (or, in an exponentially shorter amount of time) produce the new images. If you know ahead of time that there will be multiple revisions or changes of direction requiring design iteration, a generative system can reduce the overhead around manual asset production.

A generative design system can also be more versatile and extendable than a collection of static assets. If a website has 20 pages, each with a header image that has a slight variation of a base design, then in a traditional process, each new page requires the manual production of a new header image. In a generative system, dozens, hundreds, or thousands more pages could be added and the system will automatically create new images for each. To avoid repetition, the page’s ID could serve as an input parameter to ensure that each page generates a unique header image. This could then be extended to collect other page-specific data to serve as inputs to the system and produce images that are more dynamic and unique to each page.

Finally, incorporating generative approaches earlier in the creative process can expand the range of possibilities available. When confronted with an open canvas, the designer brings their own experience and stylistic references to create something new. The range of their productive abilities is also partially determined by the software and tools they use. Even if a designer doesn’t code, thinking about design as a generative process — in terms of systems and rules — can rewrite their own ‘operating software,’ opening new fields of visual and interactive possibilities in their imagination to later be concretized in code. There’s always a possibility of rules becoming ‘lost in translation’ from designer A to developer B, but the more both embrace generative design, the more these miscommunications (hopefully) lead to unexpected but fruitful surprises and ‘aha moments.’

## Building a Generative System

With this overview of generative design, along with reasons to pursue it in the creative process, let’s look at a case study of using it to produce repeating patterns in a variety of geometric styles.

{% asset_img circle1.png 'A grid of repeating, randomly rotated quarter-circles' %}

A design motif for a client of ours consisted of a grid of repeating quarter-circles in different shades of gray, some bright blue, and in various rotations. Although the designer started from a single image (manually created in Illustrator), we realized that this was a perfect opportunity to implement the pattern dynamically through a generative system.

First, we had to figure out the technical requirements for the system. On the web, it’s possible to implement something like this in a number of different ways:

- _HTML + CSS_
  Increasingly, artists are finding novel ways of using CSS to produce beautiful images. In 2018, Jay Salvat even recreated the [Mona Lisa](https://codepen.io/jaysalvat/pen/HaqBf) using a single `<div>` (styled with thousands of box-shadow rules). That said, such experiments are more esoteric than practical, and while CSS is the best tool for styling websites, it lags behind Canvas and SVG when it comes to graphics.
- _Canvas_
  Canvas provides an imperative API for producing web graphics, and is the best way to work with images on a pixel-by-pixel level. By using WebGL, it can also have a very high level of performance. However, it is raster-based, meaning that zooming in on a canvas-drawn image will be blurry, unlike...
- _SVG_
  SVG (scalable vector graphics) is probably the best choice for the above image. No matter the screen resolution or zoom level, the edges of the quarter-circles should always appear crisp, and the file size can be relatively compact.

Having chosen an SVG image to be the output of the generative system, we can start to develop the code that will generate it. Our HTML will be relatively straightforward. We just need an empty SVG element that will serve as the grid to contain all of the quarter-circles. We’re hardcoding a width and height of 1,000 pixels, and a viewBox of `0 0 25 25`. This specifies that the SVG itself, although it is 1,000 pixels wide and high, should only be 25 _units_ wide and high (this will make the math much easier, and also allow us to keep these grid dimensions regardless of what size at which the SVG is displayed).

```html
<svg id="svg" viewBox="0 0 25 25" width="1000" height="1000"></svg>
```

In JavaScript, a simple nested for loop can let us call a function for every cell in a grid, passing in the x and y values as parameters:

```js
for (let x = 0; x < 25; x++) {
  for (let y = 0; y < 25; y++) {
    someFunction(x, y);
  }
}
```

Again, because of the viewBox attribute, each unit x and y actually corresponds to 40 pixels of screen size. If the SVG were 2,000 pixels wide and high, it would be 80 pixels per unit, etc.

Now with this shell, we can write the function that generates the quarter-circles at each cell in the grid. We’ll use the SVG `<path>` element, which lets us draw arbitrary shapes and place them on the grid. (There is actually an SVG `<circle>` element, but unfortunately it only draws full circles, not segments.) A path relies on the `d` attribute to specify where it should draw. The value of the attribute is basically _a list of points_, and the path draws a line from point to point. However, depending on certain codes, the type of line can vary — it can be a straight line, an arc (a segment of a circle, which is what we want here), or a cubic or quadratic Beziér curve. [MDN is a great source of information for drawing SVG paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d).

Within the function that gets called for every grid cell, we can start at the location x, y. (Like most other graphics software, in SVG the point 0, 0 corresponds to the upper-left.) The code for “start at” or “move to” a certain point is the letter M, followed by the x, y coordinates.

```js
let pathString = `M ${x} ${y} `;
```

From here, we’re going to add on to the path string, drawing a line one unit to the right, a 90-degree arc down and to the left, and then close the path. This will give us the lower-right portion of a quarter circle (or, from 3 to 6 o’clock).

```js
pathString += `l 1 0 A 1 1 0 0 1 -1 1 Z`;
```

The lowercase L tells the path that it should be drawn relative to its current point (x, y). Then, the lowercase A (arc) command is followed by 7 numbers: The x- and y- sizes of the radius, the angle, two flags that tell it which direction (clockwise or counterclockwise) to draw the arc, and finally, the ending coordinates, again relative to its current point. Notice that, since we want to go from x + 1, y (one unit right from start) to x, y + 1 (one unit down from start), these last values are -1 and 1 (left and down). Finally, the capital Z code tells the path to finish up by going back to the start. By setting this string as the d attribute of a path and returning it, we should now have repeating quarter-circles across the entire grid!

```js
function circle(x, y) {
  let pathString = `M ${x} ${y} `;
  pathString += `l 1 0 A 1 1 0 0 1 -1 1 Z`;
  return `<path d=”${pathString}” stroke=”transparent” fill=”black” />`;
}
```

<p class="codepen" data-height="400" data-theme-id="0" data-default-tab="result" data-user="istrategylabs" data-slug-hash="yLBaWjX" style="height: 400px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Generative Circles 1/3"></p>

We also want to randomly rotate the quarter-circle to one of four orientations (0, 90, 180, or 270 degrees). The built-in JavaScript Math object has a “random” function that returns a number between 0 and 1 (with many decimal points, for example 0.235871346781623…). If we multiply this by 4 and then round it down (the “floor” function), we can get a random integer of 0, 1, 2, or 3. Then, multiplying that value by 90 will give us one of the degree values of 0, 90, 180, or 270. In the end, this looks like:

```js
const rotate = 90 * Math.floor(Math.random() * 4);
```

Unfortunately, by default, rotating an SVG element assumes that we want to rotate it around the origin (upper-left) of the SVG — but we want to rotate these quarter-circles around the center of the grid cell they occupy. To accomplish this (as ridiculous as it may sound…) we first have to move the path to the origin, rotate it, and then move it back to its position. We’ll build this in a similar way to the string for the d attribute:

```js
const dx = x + 0.5;
const dy = y + 0.5;
const rotate = 90 * Math.floor(Math.random() * 4);
const transform = `translate(${dx} ${dy}) rotate(${rotate}) translate(${-dx} ${-dy})`;
```

This string will become the value of a new “transform” attribute, which specifies how the path should be transformed geometrically (possibilities include translating/moving, scaling, rotating, and skewing). Our circle function now looks like:

```js
function circle(x, y) {
  let pathString = `M ${x} ${y} `;
  pathString += `l 1 0 A 1 1 0 0 1 -1 1 Z`;
  const dx = x + 0.5;
  const dy = y + 0.5;
  const rotate = 90 * Math.floor(Math.random() * 4);
  const transform = `translate(${dx} ${dy}) rotate(${rotate}) translate(${-dx} ${-dy})`;
  return `<path d=”${pathString}” transform=”${transform}” stroke=”transparent” fill=”black” />`;
}
```

<p class="codepen" data-height="400" data-theme-id="0" data-default-tab="result" data-user="istrategylabs" data-slug-hash="oNvzRqJ" style="height: 400px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Generative Circles 2/3"></p>

Last but not least, we want to assign a random color (chosen from a list of colors) to fill the path. We’ll include one small helper function to pick a random item from a JavaScript array, as well as the list of colors to choose from.

```js
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const colors = [‘#000’, ‘#333’, ‘#666’, ‘#999’, ‘#aaf’];
```

Putting this all together, including looping through all x, y values and adding the path to the SVG, we end up with this:

```js
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const colors = [‘#000’, ‘#333’, ‘#666’, ‘#999’, ‘#aaf’];

function circle(x, y) {
  let pathString = `M ${x} ${y} `;
  pathString += `l 1 0 A 1 1 0 0 1 -1 1 Z`;
  const dx = x + 0.5;
  const dy = y + 0.5;
  const rotate = 90 * Math.floor(Math.random() * 4);
  const transform = `translate(${dx} ${dy}) rotate(${rotate}) translate(${-dx} ${-dy})`;
  return `<path d=”${pathString}” transform=”${transform}” stroke=”transparent” fill=”${sample(colors)}” />`;
}

for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    document.getElementById(‘svg’).innerHTML += circle(x, y);
  }
}
```

<p class="codepen" data-height="400" data-theme-id="0" data-default-tab="result" data-user="istrategylabs" data-slug-hash="qBWaGpM" style="height: 400px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Generative Circles 1/3"></p>

## Extended Demo

The demo below includes a modified version of the above circular pattern, as well as three others — diamonds, hexagons, and triangles. They all use the same base SVG, and all follow the grid system, generating paths for every grid cell that differ depending on the geometric pattern selected. Check out the code for each (lines 24-71 of the JavaScript) to see how we did it!

<p class="codepen" data-height="600" data-theme-id="0" data-default-tab="result" data-user="istrategylabs" data-slug-hash="wvwMeqN" style="height: 600px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Generative Patterns in SVG"></p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

## Further Reading:

- [Generating, Simulating, Interrogating: A Computational Design Thinking Framework](https://scottpdo.gitbooks.io/generating-simulating-interrogating/) &mdash; generative design is a pillar of the larger field of computational design; my 2017 master's thesis attempted to synthesize various approaches to computational design
- [Yuan Chuan's CSS Experiments](https://codepen.io/yuanchuan/)
- [MDN SVG Reference](https://developer.mozilla.org/en-US/docs/Web/SVG)
