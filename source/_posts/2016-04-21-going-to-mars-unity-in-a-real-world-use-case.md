---
title: 'Going to Mars: Unity in a real-world use case'
author: 'Rodrigo Thauby'
description: 'Using Unity for webGL content in a real-world scenario'
---

A few months ago, we were approached by [Framestore](http://www.framestore.com/) to collaborate on a project for their client [Lockheed Martin](http://www.lockheedmartin.com/). This project was a large one: experiental and activation, plus an accompanying website design/build. I was lucky enough to be involved in the website portion.

Here's a rundown of the challenges we faced and what we learned along the way.

The site is called [Generation Beyond](https://www.generation-beyond.com/), and it's meant as an information piece on the current efforts lead by Lockheed in the space exploration field, and its educational possibilities.

The client asked for an engaging and attractive website that would act as a hub for various related aspects of this project, one of which included an interactive display of the Orion space capsule and various information points of what a Mars team would have to face on the surface of the red planet.

## The interactive experience

The experience was designed to be a 3D journey through space, starting at the beginnings of space exploration, visiting the Orion capsule mid-journey, and finally making a stop on mars itself.

## Choosing Technologies

As far choosing technologies, we were essentially limited to two options: plain JavaScript manipulation of webGL on the canvas, most likely using something like [three.js](http://threejs.org/), and the second option was to leverage a game engine that could build for webGL.

We had previous success using three.js for our [Facebook F8 tends visualization](https://isl.co/2015/03/whats-trending-on-facebook-a-touchscreen-visualization-of-the-trends-api-live-at-f8/). Coming out of that project we observed that, while using a library like three.js can greatly simplify the development process of a 3d application and camera management, there was still a fair amount of "manual" labor involved.

There were many aspects of the project that we would've had to deal with at a much lower level of abstraction if we had gone down the three.js route. For example, something that comes for free with Unity and has to be handled manually in three.js are object collision and Rigid Body physics. Other examples are: Shader creation, object/camera movement, and others.

Three.js is a great tool for abstracting [all the parts needed for an effective 3d rendering](https://dev.opera.com/articles/introduction-to-webgl-part-1/) on the browser, such as 3d object manipulation, shader construction and so on. At the end of the day though, three.js is much closer to bare metal than something like Unity or Unreal Engine are and we couldn't afford the kind of time needed to build it in that way.

At this point we knew that a game engine would get us closer and more quickly to an end product, we had a few remaining questions that needed to be addressed:

- Could we build for webGL.
- Would the build sizes be acceptable.
- How stable would the end product be.
- How performance intensive would the end product be.
- Were there any other benefits of using a game engine?

## Advantages and obstacles

The product is built by transpiling the C# codebase, through [emscripten](https://github.com/kripken/emscripten), into a low-level subset of JavaScript instructions. It works, and most surprisingly, it works *well*.

Our first order of business, then, was to analyze just how well-supported webGL builds were in Unity. We knew that it's in the bullet list of Unity's feaure list, but we wanted to know for certain if this was something we could rely on for a production build. It proved to be very robust and polished. On par with building for any other platform, with minimal adjustments necessary for us to leverage it.

One of the early caveats we did find was support for things like movie-based textures. It's some of these more sophisticated features that don't seem to have one-to-one parity in the webGL world.

Thankfully, because the design accounts for these limitations, and also because of the environment in which it's going to be run (the browser), we could offload some of those features and build them as part of the website portion, using standard web technologies. It was important, however, that we keep both technologies (Unity and the Web) tightly integrated to each other. Unity has fantastic support for interoperability between the two of them, exposing all public functions of our GameObjects to the JavaScript runtime. Conversely, Unity also has access to the global JavaScript scope through an external interface call.

In addition, because the Unity community and marketplace is so mature, we could leverage many of the third-party plugins to facilitate some of the more tedious and complex tasks we would've had to manage with three.js, for example. We used a [Camera Path Animator](https://www.assetstore.unity3d.com/en/#!/content/617) for creating and managing all camera movement in a much more simplified way. We simply needed to trigger animations as necessary, and we could create and tweak those paths in a visual environment. The other great plugin we used, and is worth mentioning, is the fantastic [ShaderForge](http://acegikmo.com/shaderforge/), which allowed us to really hone in on the visual polish we needed for this project.

## Lessons learned

Early on we realized that memory usage is a big concern when building for webGL. It's impossible to gauge what kind of hardware will be using the application, so we needed to use our best judgement when creating the assets that would form the experience.

In addition, some issues will only really surface when faced with limited memory bandwidth. For example, traversing the Game Object hierarchy in an efficient way becomes paramount, as you can quickly overflow the memory alloted when running inside a browser. We had to be very judicious and save all results from any type of GameObject query for future use, instead of attempting to query multiple times.

Unity builds its webGL products with Gzipping done for you already. Unity's JavaScript loader then takes that and unzips it itself, using the JavaScript engine. This project used that as is, but we're currently investigating wether we could build unzipped, and use our webserver's gzipping and built-in browser capabilities to unzip at a lower cost to the end client.

Finally, the last piece to make this experience great, was to present to the user a polished experience *while* we were loading the Unity product. Out of the box, Unity suggests that you include their loader via a script tag. The main files will then be downloaded asynchronously. Once the client has downloaded the files - which can be quite large, - Unity loads it all into memory. There is a noticeable freeze of the browser tab while all that data gets loaded into memory, and unfortunately there are no "middle-points" in this process where we could update our UI to reflect some process.

What we came up with then was what is commonly referred to as a white lie. When we load the page, we present the user with a loader bar, moving rapidly to 25%. Then, our own code would asynchronously load the Unity loader, once that was done, our progress bar would jump to 50%. At this point, we have our UI try to move to 75%, usually hanging while Unity dumps data into memory. A simple callback from Unity when it's ready to go tells our bar to go to 100%. This technique proved effective, as it gives the user a sense of feedback that the process is in motion and everything is fine.

All in all, this project was a first for ISL in many regards, and we learned a lot along the way. But the end result surpassed our expectations of what we could do, especially in such a tight timeline.
