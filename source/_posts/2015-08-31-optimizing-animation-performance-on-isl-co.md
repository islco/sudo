---
title: "Optimizing Animation Performance On ISL.co"
author: Eli Fitch
---

When it came to building ISL.co, performance was a huge priority; we wanted our site to load quickly, feel responsive & alive throughout the entire experience. This meant animation. A lot of animation. A lot of quite complex animation. It also meant creating all this motion without breaking a rock solid 60 frames per second (fps) stride. I’m going to walk you through the handful of techniques we used to jank bust our site and make sure our render performance was butter smooth.

## Choosing The Right Properties To Animate
{% asset_img 'cant-stop-wont-stop-300.gif' "Can't stop won't stop" %}

When it comes to animation, all CSS properties are not created equal.  There are key differences in how hard it is for the browser to animate a property, and that difficulty shows up with a slow framerate.  Understanding how your choices impact page rendering is crucial to creating smooth animations.

The most important change you can make to how you create animations is to know which properties animate the smoothest.

In the broadest of strokes, browsers render webpages in three basic steps:

- Laying out elements’ sizes and positions
- Painting elements onto bitmaps
- Compositing (arranging) these bitmaps onto the screen

By animating a CSS property, you’re asking the browser to repeat these steps again and again with every frame. Certain properties force the browser to do the entire process, other properties allow the browser to skip steps, saving time and making the animation appear more smooth.

## Layout
Layout is the most costly in terms of performance.  Not only does it necessitate a repaint and recomposition of the element, but also potentially that element’s neighbors as well.  If an element changes size or relative position and nudges its neighbors, all of the other elements that are then shifted in response must be laid out, repainted and composited again.  This is called “layout thrash”, as the layout whips around each frame.  Properties like height/width, top/bottom/left/right, padding, and font size are all layout properties.

## Paint
Paint properties are “appearance” properties such as color, background-color, background-position, and box-shadow. Painting can range from costly to trivial in direct proportion to how many pixels must be painted. Time spent repainting a small area might be completely negligible, while repainting something large, like a hero image, might be prohibitive. Repainting large areas over a long length of time can be very janky, like many poorly executed parallax experiences. However, don’t avoid repainting like the plague, it’s absolutely necessary from time to time, just be mindful of potential issues.

## Composite
Composite properties are the answer to all of these headaches. They don’t require changing layouts or repainting.  Instead, all of their changes happen in a vacuum. The GPU will automatically assign elements to their own layer when necessary (though this can be forced) and animate them individually.

**Composite properties:**

- opacity
- transform: translate/scale/rotate
- seriously that’s it

I know, it kind of sucks that that’s all you get, but you can do a lot with just transform and opacity if you keep your wits about you.  Sometimes you will have to rethink an animation to use only these properties, but the performance gains you get are more than worth it.

## Thinking Creatively

More than once while building ISL.co we had to refactor an animation for performance reasons.  Lets go through an example of converting a layout thrashing animation to a performant composite animation: the blog filter.

One of the main weaknesses of relying on transform to animate objects instead of top/bottom/left/right or other layout properties, is that a translating object won’t nudge its neighbors. It’s almost like an element gets picked up and moved over top of the page, in a completely separate context. Animations like our blog sort drawer would traditionally rely on animating layout properties, in this case max-height.

In our first attempt, we decided to set `max-height` to `0` and animated max height to the drawer’s natural height. The drawer appeared to slide down, and it bumped the blog feed down with it. Unfortunately animating max-height caused a lot of thrash, leading to stutters that dropped the framerate to as low as 7 fps.  As you can see in the GIF (pronounced like “gift”) below, it was pretty bad, so we tried to find a way to animate with just transform.

{% asset_img 'janky-animation.gif' 'Janky animation'%}

After max-height failed, we knew we had to rely on transform; but pulling the drawer up underneath the hero image with `transform: translateY(-100%)` just left a big gap where the menu once was.  Animating to `translateY(0)` would simply slide the menu back to its original position on the page, without sliding the rest of the page’s content down with it.  We had to get a little creative.

Instead of using an initial transform, we pulled up the menu with a negative margin (a layout property).  This erased the big gap in the initial state.  However, we didn’t animate this property. We set it once, and left it there. On click of the drawer toggle, we animated the drawer, as well as its siblings, to `transform: translateY(0)` with the same duration and easing. This gave the pleasing appearance of the menu nudging its siblings with all the performance gains of using only composite properties. Animating transform, even on almost an entire page, was orders of magnitude more performant than animating max height on a single element. Check out the difference in the GIF below.

{% asset_img 'smooth-animation-600.gif' "Smooth animation"%}

## Test Like Crazy

It’s not always 100% possible to avoid animating layout properties or paint properties. Just make sure you’re testing to make sure everything is okay.

It’s impossible to overstate the importance of making a commitment to testing render performance *during* development. Performance problems are often only noticeable once a significant amount of damage has been done, and there’s a nightmarish rats nest of incremental little issues that have to be resolved. Testing while you work makes it possible to pick up these small little straws before things get too overwhelming.

> “Don’t guess it, Test it”
– Paul Lewis


Chrome, Firefox, and Safari all let you see paint and render events frame by frame in the network tab. Keeping a close eye on this while building an animation is absolutely essential, so you can quickly rectify mistakes or explore alternatives. Chrome also comes packaged with an additional suite of performance tools in the “Rendering” tab of the console. You can enable an FPS meter, show layer borders and visualize browser painting. **Here’s how you get there:**

{% asset_img 'rendering-tools.gif' "Rendering tools in Chrome" %}

Neither Firefox nor Safari come with the breadth of tools that Chrome does, but their internal rendering processes are similar enough that improvements will be felt across the board even if you’re primarily working in Chrome. Many of Chrome’s ancillary render testing tools are available in other browsers as addons.


## More Resources

Passionate about render performance? Congratulations, you’re a huge nerd.
Here are some resources, you weird nerd butt:

- [CSS Triggers](https://csstriggers.com): A property-by-property breakdown of whether a property triggers layout, painting, or composition
- [HTML5 Rocks – High Performance Animations](https://www.html5rocks.com/en/tutorials/speed/high-performance-animations): More on choosing the right properties to animate
- [HTML5 Rocks – Scrolling Performance](https://www.html5rocks.com/en/tutorials/speed/scrolling): Goes in depth on render performance testing and jank busting scrolling

