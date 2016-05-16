title: 'Going to Mars: Unity in a real-world use case'
author: 'Rodrigo Thauby'
description: 'Using Unity for webGL content in a real-world scenario'
---

A few months ago, we were approached by [Framestore](http://www.framestore.com/) to collaborate on a project for [Lockheed Martin](http://www.lockheedmartin.com/). This multifaceted project consisted of a real world experiential component plus an accompanying website. We'll eventually share more details of the physical build, but this post will only focus on the website portion of the project and the associated challenges and lessons learned along the way.

The final product can be seen at [https://www.generation-beyond.com/](https://www.generation-beyond.com/).  The site is an information hub on Lockheed's current efforts in space exploration and the associated educational possibilities.

One of Lockheed's efforts in particular we highlighted was an interactive display of the Orion space capsule and various situations a Mars team would have to face on the surface of the red planet.  The experience was designed to be a 3D journey through space, starting at the beginnings of space exploration, visiting the Orion capsule mid-journey, and finally making a stop on mars itself.

## Choosing Technologies

We saw two options:

1. Plain JavaScript manipulation of [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) on the canvas - most likely using something like [three.js](http://threejs.org/)
2. Leverage a game engine that could build for WebGL.

We have previously used three.js, most recently for our [Facebook F8 tends visualization](https://isl.co/2015/03/whats-trending-on-facebook-a-touchscreen-visualization-of-the-trends-api-live-at-f8/). However, while a library like three.js can greatly simplify the development process of a 3d application, there is still a fair amount of "manual" labor involved.  While javascript manipulation of webGL was possible, it did not seem feasible given the time constraints.  We had to use a game engine.

In choosing an engine there were a few key criteria that had to be addressed:

- Could we build for webGL?
- Would the build sizes be acceptable?
- How would the product perform on various devices?
- Were there any other benefits of using a game engine?

## Advantages and obstacles

We decided on the Unity game engine, and the first order of business was to analyze just how well-supported webGL builds were in Unity.  Put simply, it works pretty well.  However, we did find a few limitations, such as a lack of support for things like movie-based textures. Some of these more sophisticated Unity features don't currently have clear  one-to-one parity in the webGL world.

Thankfully, because the design accounts for these limitations, and also because of the environment in which it's going to be run (the browser), we could offload some of those features and build them as part of the website portion, using standard web technologies. The 3D application is simply rendered in a canvas tag, which can then be treated as a standard HTML element. This gave us enormous flexibility to separate concerns between the web portion and the 3D side of things. For example, all video in the experience was hosted on vimeo and was embedded using their standard plugin, we simply had to overlay them on top of the the 3D canvas instead of trying to integrate the video *within* the 3d application.

It was important, however, that we kept both technologies (Unity and the Web) tightly integrated to each other. The experience had to feel seamless to the user. Unity has fantastic support for interoperability between the 3D application and the browser, exposing all public functions of our Game Objects to the JavaScript runtime. Conversely, Unity also has access to the global JavaScript scope through an external interface call.

In addition, because the Unity community and marketplace is so mature, we could leverage many of the third-party plugins to facilitate some of the more tedious and complex tasks we would've had to manage with three.js.  For example, we used a [Camera Path Animator](https://www.assetstore.unity3d.com/en/#!/content/617) to create and manage all camera movement. We simply needed to trigger animations as necessary, and we could create and tweak those paths in a visual environment, as opposed to having to manage them programmatically. The other great plugin we used is [ShaderForge](http://acegikmo.com/shaderforge/), which allowed us to really hone in on the visual polish we needed for this project.

## Lessons learned

Early on, we realized that memory usage is a big concern when building for WebGL. It's impossible to gauge what kind of hardware the application will be run on. Thus, we needed to use our best judgement when creating the assets that would form the experience and balance fidelity with browser footprint.

Some issues only surfaced when faced with limited memory. For example, traversing the Game Object hierarchy in an efficient way becomes paramount when running inside a browser, as you can quickly overflow the memory allocated. To overcome this hurdle, we saved all results from any type of Game Object query for future use, an algorithmic process known as [memoization](https://en.wikipedia.org/wiki/Memoization) (a fancy word for caching), instead of attempting to repeatadly query for the same thing.

Unity builds its webGL products with Gzipping enabled out of the box. Unity's JavaScript loader then takes that and unzips it itself, using the JavaScript engine. This project used that as is, but we're currently investigating whether we could build unzipped, and use our webserver's gzipping and built-in browser capabilities to unzip at a lower cost to the end client.

Finally, the last piece of the puzzle, was to present to the user a polished experience *while* we were loading the Unity product. Out of the box, Unity suggests that you include their loader via a script tag -- which downloads the files asynchronously. Once the client downloads the files - which can be quite large - Unity loads everything into memory. There is a noticeable freeze of the browser during this and unfortunately there are no "middle-points" in this process to update the UI to reflect the progress.

What we came up with then was what is commonly referred to as "fake it til you make it". We exploited the psychological fact that people don’t mind a jerky loading experience and displayed a “fake” pre-programed loading message that was only loosely attached to the actual loading progress. When the page loads, the user  sees the loader bar move rapidly to 25%. Then, our code would asynchronously load the Unity loader, and upon completion the progress bar would jump to 50%. At this point, we have the UI try to “progress” to 75%, usually hanging while Unity dumps data into memory. A simple callback from Unity, when it's ready to go, tells the bar to go to 100%. This technique proved effective, as it gives the user a sense of feedback that the process is in motion and everything is fine.

All in all, this project was a first for ISL in many regards, and we learned a lot along the way. But the end result surpassed our expectations of what we could do, especially in such a tight timeline.

