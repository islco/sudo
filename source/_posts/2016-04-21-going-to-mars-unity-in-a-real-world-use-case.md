---
title: 'Going to Mars: Unity in a real-world use case'
author: 'Rodrigo Thauby'
description: 'Using Unity for webGL content in a real-world scenario'
---

A few months ago, we were approached by [Framestore](http://www.framestore.com/), a fellow agency, to collaborate on a project for their client [Lockheed Martin](http://www.lockheedmartin.com/). This project involved a real world experiential component plus an accompanying website design/build. While we'd love to share all the details, this post will only focus on the website portion of the project and the associated challenges and lessons learned along the way.

The site we delivered can be viewed at [Generation Beyond](https://www.generation-beyond.com/).  It is an information hub on Lockheed's current efforts in space exploration and their educational possibilities. 

One effort of Lockheed's we highlighted was an interactive display of the Orion space capsule and various information points of what a Mars team would have to face on the surface of the red planet.  The experience was designed to be a 3D journey through space, starting at the beginnings of space exploration, visiting the Orion capsule mid-journey, and finally making a stop on mars itself.

## Choosing Technologies

We were essentially limited to two options to accomplish the goal: plain JavaScript manipulation of webGL on the canvas, most likely using something like [three.js](http://threejs.org/), or, option \#2 - leverage a game engine that could build for webGL.

We have had previous success using three.js for our [Facebook F8 tends visualization](https://isl.co/2015/03/whats-trending-on-facebook-a-touchscreen-visualization-of-the-trends-api-live-at-f8/).  However, while using a library like three.js can greatly simplify the development process of a 3d application and camera management, there was still a fair amount of "manual" labor involved.  Thus, while javascript manupulation of webGL was possible, it did not seem feasible.  We had to use a game engine.  

In choosing an engine there were a few key criteria that had to be addressed:

- Could we build for webGL?
- Would the build sizes be acceptable?
- How stable would the end product be?
- How performance intensive would the end product be?
- Were there any other benefits of using a game engine?

## Advantages and obstacles

Our game engine of choice was the Unity egine and our first order of business, was to analyze just how well-supported webGL builds were in Unity.  Put simply, it works pretty darn well just like it claims.  However, we did find a few limitations such as a lack of support for things like movie-based textures. Some of these more sophisticated Unity features don't seem to have one-to-one parity in the webGL world.

Thankfully, because the design accounts for these limitations, and also because of the environment in which it's going to be run (the browser), we could offload some of those features and build them as part of the website portion, using standard web technologies. It was important, however, that we kept both technologies (Unity and the Web) tightly integrated to each other. Unity has fantastic support for interoperability between the two of them, exposing all public functions of our GameObjects to the JavaScript runtime. Conversely, Unity also has access to the global JavaScript scope through an external interface call.

In addition, because the Unity community and marketplace is so mature, we could leverage many of the third-party plugins to facilitate some of the more tedious and complex tasks we would've had to manage with three.js, for example. We used a [Camera Path Animator](https://www.assetstore.unity3d.com/en/#!/content/617) for creating and managing all camera movement in a much more simplified way. We simply needed to trigger animations as necessary, and we could create and tweak those paths in a visual environment. The other great plugin we used, is the fantastic [ShaderForge](http://acegikmo.com/shaderforge/), which allowed us to really hone in on the visual polish we needed for this project.

## Lessons learned

Early on we realized that memory usage is a big concern when building for webGL. It's impossible to gauge what kind of hardware will be using the application, so we needed to use our best judgement when creating the assets that would form the experience.

In addition, some issues will only really surface when faced with limited memory bandwidth. For example, traversing the Game Object hierarchy in an efficient way becomes paramount, as you can quickly overflow the memory alloted when running inside a browser. We had to be very judicious and save all results from any type of GameObject query for future use, instead of attempting to query multiple times.

Unity builds its webGL products with Gzipping done for you already. Unity's JavaScript loader then takes that and unzips it itself, using the JavaScript engine. This project used that as is, but we're currently investigating wether we could build unzipped, and use our webserver's gzipping and built-in browser capabilities to unzip at a lower cost to the end client.

Finally, the last piece to make this experience great, was to present to the user a polished experience *while* we were loading the Unity product. Out of the box, Unity suggests that you include their loader via a script tag. The main files will then be downloaded asynchronously. Once the client has downloaded the files - which can be quite large, - Unity loads it all into memory. There is a noticeable freeze of the browser tab while all that data gets loaded into memory, and unfortunately there are no "middle-points" in this process where we could update our UI to reflect some process.

What we came up with then was what is commonly referred to as a white lie. When we load the page, we present the user with a loader bar, moving rapidly to 25%. Then, our own code would asynchronously load the Unity loader, once that was done, our progress bar would jump to 50%. At this point, we have our UI try to move to 75%, usually hanging while Unity dumps data into memory. A simple callback from Unity when it's ready to go tells our bar to go to 100%. This technique proved effective, as it gives the user a sense of feedback that the process is in motion and everything is fine.

All in all, this project was a first for ISL in many regards, and we learned a lot along the way. But the end result surpassed our expectations of what we could do, especially in such a tight timeline.
