---
title: "Ditch the Carousel:  Creating a Horizontal Scroll Effect"
author: Lucas Eckman & Paul Best
description: We rolled our own horizontal scroll effect.
---

In this tutorial, we're going to look at how to build a component that temporarily changes the orientation of a user's scroll from vertical to horizontal <b>without hijacking the browser's scroll rate</b>! Unlike the much maligned <a href="http://ui-patterns.com/patterns/Carousel" target="_blank">carousel</a> that forces users to tap left & right arrows to advance, this approach guides users through <i>all</i> content items in a set while maintaining expected scrolling behavior.

<!-- Optional giphy source https://giphy.com/gifs/Pk9Y1mOAFfgMh0KuIb/links -->
<img src="/translate-vertical-horizontal/horizontalscroll@800px.gif" style="box-shadow:5px 5px 20px rgba(0,0,0,.05)">
<p style="font-size:.8rem;color: #8a8a8a;margin-top:-10px;font-style:italic">Note how the the viewport visually "locks" in place, but the browser's scrollbar still moves down as the user scrolls & content pushs horizontally.</p>

Try it out for yourself:
<iframe src="https://codesandbox.io/embed/horizontal-scroll-usestate-nlkyt?fontsize=14" title="horizontal-scroll-usestate" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>


### Jump to:
<ul>
<li><a href="#UX-Primer">UX Primer</a></li>
<li><a href="#The-Desired-Behavior">Desired Behavior</a></li>
<li><a href="#Approach">Approach</a></li>
<li><a href="#The-Effect-Explained">The Effect Explained</a></li>
<li><a href="#Implementation">Implementation</a></li>
<li><a href="#The-Full-Implementation-in-Action">See it in Action</a></li>
</ul>

## UX Primer
<b>TLDR — Use this pattern when you have a series of points that tell a cohsive story. Its best applied to a section below the page header/hero.</b>

Carousels (sometimes called 'sliders') are one of the internet's most common patterns.  They are most often found as a 'hero' element atop landing pages or e-commerce sites.  You can also find them in the middle of editorials like articles or <a href="#">scrollytelling</a> pages, where they help break up longer text blocks with featured images or visual call-outs.   The greatest benefit carousels provide is that <b>they allow a set of "like" things to occupy the same level of heirarchy</b>.  This offers many strategic benefits, and can also be an easy design choice to keep layout simple and recognizable. While the usability challenges of carousels are well documented, there is one big fat downside — no one sees the content. [Studies](https://erikrunyon.com/2013/07/carousel-interaction-stats/) show that as few as 2% of people may get past the first carousel item.  This is where the horizontal scroll effect really shines; we get the benefits of a carousel without the dreaded drop-off in engagement.

Let's use Elizabeth Warren's site as a quick case study.
<blockquote><u>Our Brief:</u> Warren's team wants to feature ~5 of her plans on their homepage.  They need to be able to quickly swap the plans out for new ones with minimal effort.  Their primary goal is to give users an overview of the breadth of her ideas.</blockquote>

Ok, so how do we go about solving this? We have an odd number of plans, and a requirement to swap them out on the fly (aka minimal dev effort).  Given these details, a more bespoke gallery or tile layout that stacks them may not be approriate — it would end up looking awkward/boring or require too much custom effort to manage the layout if the number of featured plans change.

Here we can see what it looks like with the traditional carousel solution:
{% asset_img warren-bad.jpg %}
<p style="font-size:.8rem;color: #8a8a8a;margin-top:-10px;font-style:italic">This puts the burden on users to stop and choose to engage.  Not ideal given the goals of our brief. <span style="font-style:normal !important">👎</span></p>

Ok, so what if we try the horizontal scroll effect?

<img src="/translate-vertical-horizontal/warren-good.gif" style="border:3px solid #E4E4E4;width:800px">
<p style="font-size:.8rem;color: #8a8a8a;margin-top:-10px;font-style:italic">Much better! Now the change in scoll direction provides an extra level of interest while ensuring users will scan all featured plans <span style="font-style:normal !important">👍</span>.  This approach has an added benefit in that "See All Plans" is accessible at all times. Win!</p>

Turns out Warren even has a plan for carousels! See it [live on her site](https://elizabethwarren.com).

## The Desired Behavior

While scrolljacking is frequently debated, its reputation as an 'antipattern' comes from the manipulation of the browser's natural scroll momentum. This could include replacing the user's scroll behavior with a pager, or changing the speed & timing of the mousewheel/scroll.  Instead, for this tutorial we'll <i>harness</i> the expected behavior of the scroll wheel, where the browser's sensitivity of pixels moved per amount scrolled is respected.
<blockquote>We'll harness the expected behavior of the scroll wheel, respecting the browser's sensitivity of pixels moved per amount scrolled. </blockquote>

In our desired behavior, the user scrolls down naturally through the page until he or she arrives at a section that contains a row of content laid out horizontally. The content extends beyond the right edge of the viewport, and the user understands there are more items beyond that edge.

Once this 100vh (100% viewport height) section occupies the entire height of the viewport, vertical scrolling should appear to lock, holding the section in place. Any additional vertical scrolling (or remaining scroll inertia left over from scrolling into the section) will be translated to move the row of cards across the page to the left, causing a horizontal scroll through these cards. Scrolling back up should send the cards back to the right.

See a similar effect in action on the official [iPad Pro](https://www.apple.com/ipad-pro/) site, Twitch's [brand page](), or the site for [Speedgate](https://playspeedgate.org/) (a sport designed by A.I.).

## Approach
<i>Disclaimer: This tutorial assumes a working understanding of CSS, JavaScript, React, and to a lesser extent Styled Components.</i>

At first our team set out to find a third party library that might handle this for us. We found plenty of horizontal scroll / swiper examples, but most of these would require the user to stop scrolling on their own accord and switch to manual horizontal scrolling or swiping. There were examples of horizontal swipers that would capture vertical scroll events and translate them into horizontal scrolling, but the user would need to pause in that part of the page and enter their mouse into the swiping container before resuming scrolling.

We needed to achieve the experience of a section locking into place, with vertical scroll being immediately translated onto the horizontal array of cards. We also needed a solution that would be compatible with Chrome, Firefox, Safari and Edge. We decided to experiment with our own implementation, inspired by the Speedgate example.

Before long, we found a clue as to how it’s working. Although the section appears to lock your vertical scrolling, and you don’t see anything new on the page scrolling up into view from below, you can in fact see the browser’s scrollbar proceeding down its track. Along with the observation that the horizontal scroll is being controlled with `transform: translate`, we were closing in on the engine of the scroll effect.

## The Effect Explained

First, let's dissect it from the perspective of the user's viewport:

<div style="padding: 0.75rem 0 1.5rem"><iframe height="700" style="width: 100%;" scrolling="no" title="Horizontal Scroll Diagram 2" src="//codepen.io/istrategylabs/embed/QWLOLXr/?height=265&theme-id=light&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/istrategylabs/pen/QWLOLXr/'>Horizontal Scroll Diagram 2</a> by ISL
  (<a href='https://codepen.io/istrategylabs'>@istrategylabs</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe></div>

The key to this effect is that the parent section containing the horizontal scroll cards (shown in green) is taller than it at first appears. In fact, it’s a few times taller than its 100vh inner content (shown in blue). We’ll get to exactly how much taller it needs to be, later.

The inner content container, along with `height: 100vh`, also has the CSS properties `position: sticky` and `top: 0`. As you scroll down, this sticky container sticks to the top of the viewport. Because it’s 100vh in height, the viewport appears to be stationary. The moving scrollbar is the only tell.

The second key is how we translate the smooth vertical scrolling input of the user to an analogous horizontal scroll of the cards. That is, the user can cast a strong downward scroll with the touchpad, and once the sticky section locks into place, the inertia from that scroll will carry into the horizontal scroll. As the user continues to scroll up and down, the horizontal scroll will move with the same effect or momentum as the typical vertical scroll.

We accomplish this by getting the sticky container’s `offsetTop` (a pixel value) with JavaScript. As the sticky container moves down the page, it gets farther away from the top of its own container, and the value of `offsetTop` increases. As the user scrolls, we apply this pixel value of the `offsetTop` distance with `transform: translateX()` as an inline `style` property on the horizontal cards -1:1 (negative so that the cards move to the left).

The result is a pleasing horizontal scroll effect controlled with the natural and familiar scrolling input of the user. You can see a basic illustration of this effect below viewed from two different perspectives (note that this codepen is a fake effect for illustrative purposes).


Let's look back at our cross-section to see see what's really happening on when you scroll:

<div style="padding: 0.75rem 0 1.5rem"><iframe height="700" style="width: 100%;" scrolling="no" title="Horizontal Scroll Diagram 1" src="//codepen.io/istrategylabs/embed/rNBYBpZ/?height=265&theme-id=light&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/istrategylabs/pen/rNBYBpZ/'>Horizontal Scroll Diagram 1</a> by ISL
  (<a href='https://codepen.io/istrategylabs'>@istrategylabs</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe></div>

The green box is the tall outer container. The blue box represents the viewport and the 100vh sticky inner container inside of it. The red box is the horizontal translate container with the array of cards inside. As you scroll down and then back up again, the distance from the top of the blue box to the top of the green box (the `offsetTop` value) increases. This distance is applied -1:1 to the `transform: translateX()` inline style on the red box. If you scroll back up, the `offsetTop` value decreases, and the red box moves back to the right.

## Implementation

As some background to our implementation, here are the high-level technologies in our project:

- [Gatsby](https://www.gatsbyjs.org/)
- [React](https://reactjs.org/)
- [Styled Components](https://www.styled-components.com/)

We will also be using the following features of those technologies and of CSS:

- React [Hooks](https://reactjs.org/docs/hooks-intro.html) (useState, useEffect, useRef)
- Styled Components [.attrs](https://www.styled-components.com/docs/api#attrs)
- CSS [will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change) property

In our `index.js` file we are doing our basic React plumbing and setting up our minimal markup and page styles so we can demo the horizontal scroll. We apply `box-sizing: border box` universally and remove padding from the body using Styled Components’ `createGlobalStyle` utility. We also create an array of sample cards with a container that we will pass as children to the horizontal scroll.

Moving on now to `horizontal-scroll.js`, we will take this in a few steps.

### Step 0: Setting up State

In our example we are using the React Hook `useState` which allows us to configure our two state variables and their respective state setters. You could just as easily refactor to a stateful class component and use traditional React state management with `setState`.

We are tracking two properties in state (all stored as numbers representing pixels):

- How tall we want our tall outer container to be: `dynamicHeight`
- How much should we translate the cards left or right: `translateX`

```javascript
import React, { useState } from 'react'

export default () => {

    const [dynamicHeight, setDynamicHeight] = useState(null)
    const [translateX, setTranslateX] = useState(0)

    return (
        ...
    )
}
```

We will get to how we will use these in step 4.

### Step 1: The Tall Outer Container (But How Tall?)

Earlier I mentioned that later in the post we’d be talking about exactly how tall this container actually needed to be. The answer is that it needs to be tall enough so that when our sticky inner container reaches the bottom of the tall outer container, this distance--once translated to the horizontal array of cards--will be enough to bring the last card into the viewport with some additional padding on the right.

Determining this depends on a few factors: the width of the cards once laid out, the width of the viewport, and then the height of the viewport. You can investigate this yourself, or see the calculation in the code. Basically, we are adding the width of the cards that are beyond the right edge of the viewport to the height of the viewport, plus a buffer of 150px. This will ensure that the sticky inner container will have enough vertical runway to translate all of the cards into view.

We will investigate how we are calculating and adjusting this height in step 4.

### Step 2: The Sticky Inner Container

This inner container will be configured entirely with CSS. We will use `position: sticky`, `height: 100vh` and `top: 0`. This will cause it to stick to the top of the viewport and cover the entire screen, creating the illusion that we are not scrolling vertically, even though we are indeed traveling through the tall outer container. We will also apply `overflow-x: hidden` to hide the overflow and prevent a scrollbar from appearing.

```javascript
import styled from 'styled-components'

...

const StickyInnerContainer = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
`;
```

### Step 3: The Horizontal Translate Container

This is the container that will hold the cards and move left and right. We will apply the `transform: translateX()` as an inline style using Styled Components’ `.attrs` utility.

`.attrs` allows you to access the style and other inline properties programatically with Styled Components. It serves our purposes very well in this case, as the actual pixel value of the transform will be passed as a prop, which we'll get to in the next step. Note in the code snippet below that we are destructuring the `translateX` prop.

```javascript
import styled from 'styled-components'

...

const HorizontalTranslateContainer = styled.div.attrs(({ translateX }) => ({
  style: { transform: `translateX(${translateX}px)` }
}))`
  position: absolute;
  height: 100%;
  will-change: transform;
`;
```

A very helpful CSS property we are using here is `will-change`. By applying `will-change: transform` to this element, we are telling the browser to expect that at any moment it may need to transform. This improves the performance of the effect. Note that this property is meant to be used as a “last resort” to fix a performance problem, not as a default tool for prioritizing performance in the browser. Typically browsers are pretty good at this themselves. In our case, we were experiencing some slowdown and stuttering, and applying `will-change` resulted in a dramatic improvement.

This container itself will move left and right, but otherwise it will delegate positioning to its direct child. We’ll use CSS to position it absolutely with 100% height, so that whatever we pass as its child can be positioned comfortably.

### Step 4: Wiring It Up

So far we have explored the containers and their CSS properties that will serve as the groundwork for our horizontal scroll effect. But what about the logic itself?

Because this is React, our starting point will be on component mount. And because we are using React Hooks, we’ll be employing `useEffect`.

`useEffect` is like all of the traditional React lifecycle methods rolled into one. You can read more about how the different lifecycle needs are controlled in the React docs. For our purposes, you just need to understand that when you include an empty array as the second argument of `useEffect`, then the function passed as the first argument will fire only once, on mount. So it’s just like `componentDidMount`.

We'll also be using React `refs`. These allow us to target a component once it's mounted on the DOM and get its rendered attributes. In this case we are accessing the horizontal translate container's width and the sticky inner container's `offsetTop`.

First let's take a look at the functions we'll be calling in our `useEffect`:

```javascript
const calcDynamicHeight = objectWidth => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return objectWidth - vw + vh + 150;
};

const handleDynamicHeight = (ref, setDynamicHeight) => {
  const objectWidth = ref.current.scrollWidth;
  const dynamicHeight = calcDynamicHeight(objectWidth);
  setDynamicHeight(dynamicHeight);
};

const applyScrollListener = (ref, setTranslateX) => {
  window.addEventListener("scroll", () => {
    const offsetTop = -ref.current.offsetTop;
    setTranslateX(offsetTop);
  });
};
```

And here is our horizontal scroll component including the `useEffect`:

```javascript
import React, { useState, useEffect, useRef } from "react";

export default () => {
  const [dynamicHeight, setDynamicHeight] = useState(null);
  const [translateX, setTranslateX] = useState(0);

  const containerRef = useRef(null);
  const objectRef = useRef(null);

  const resizeHandler = () => {
    handleDynamicHeight(objectRef, setDynamicHeight);
  };

  useEffect(() => {
    handleDynamicHeight(objectRef, setDynamicHeight);
    window.addEventListener("resize", resizeHandler);
    applyScrollListener(containerRef, setTranslateX);
  }, []);

  return (
    <TallOuterContainer dynamicHeight={dynamicHeight}>
      <StickyInnerContainer ref={containerRef}>
        <HorizontalTranslateContainer translateX={translateX} ref={objectRef}>
          ...
        </HorizontalTranslateContainer>
      </StickyInnerContainer>
    </TallOuterContainer>
  );
};
```

On mount in our `useEffect`, we first take care of setting the height of the tall outer container, and add a listener to update that height in case the width or height of the viewport changes.

Then, we’ll get our horizontal translate engine going. We’ll apply a scroll listener that checks our sticky inner container’s `offsetTop` whenever the user scrolls, and stores that value in the `translateX` state variable with `setTranslateX`. Remember, when the user scrolls the sticky inner container into view, it will stick to the top of the viewport and its `offsetTop` value will increase or decrease with its distance from the top of the tall outer container.

Using Styled Components, we can then pass this pixel value as a prop to the horizontal translate container. From there, we interpolate the value into the `transform: translateX()` CSS property as an inline style using `.attrs`.

Now, whenever our sticky inner container moves up and down within the tall outer container, our horizontal translate container moves left-to-right in kind!

## The Full Implementation in Action

<iframe src="https://codesandbox.io/embed/horizontal-scroll-usestate-nlkyt?fontsize=14" title="horizontal-scroll-usestate" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
