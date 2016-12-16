---
title: 'Early days in VR'
author: 'Rodrigo Thauby'
description: 'How we developed our first VR game on Unreal Engine 4 for the HTC VIVE'
---

There are a lot of gamers here in our team. We've played all the big games together online: Counter-Strike GO, Diablo III, GTA V, Overwatch, you name it. Naturally some of us have also spent a fair amount delving into game development as more than just a hobby.

Further learning and exploration led us to try our hand at VR, so we came up with the idea of building a very simple game; and what could be simpler than throwing bean bags into a hole? Thus we set out to build a Cornhole video game. We thought it would also be a good idea to try making it multiplayer, because why make it too easy on ourselves?

We bought 2 HTC Vives and got to work.

I had personally been developing in the Unreal Engine for over a year. It was mostly relegated to building some experiments and demos, but I was familiar enough with the following work pipeline: Blender to Substance Painter to Unreal Engine. This would be the first time I would try to build something end-to-end towards a finished product.

We had also put in some time in Unity in the past, so we felt comfortable using both engines. We analyzed how complex it would've been to integrate the HTC Vive into either engine, and determined that it was well supported on both. The decision then was mostly based on our comfort level with leveraging either engine. Furthermore, we thought we could achieve a higher degree of visual fidelity and immersion with the Unreal Engine over Unity with little effort.

## The Easy stuff

We were already very comfortable with the asset creation pipeline of mesh creation in Blender, texturing in Substance Designer/Painter and bringing all those assets into UE4. There isn't much worth note here aside from a few pretty screenshots. Enjoy!

<div class="row">
    <div class="small-12 medium-6 columns">
        {% asset_img barn.png 'A barn' %}
    </div>
    <div class="small-12 medium-6 columns">
        {% asset_img house.png 'A country house' %}
    </div>
    <div class="small-12 medium-6 columns">
        {% asset_img picnic.png 'A picnic table' %}
    </div>
    <div class="small-12 medium-6 columns">
        {% asset_img platform.png 'A cornhole platform' %}
    </div>
</div>

## Challenges

There were many challenges that we faced when we set out to build this game. Many of these challenges were unknown to us at first and were discovered as we progressed with the development process, learned the limitations of the engine, and discovered what we wanted out of the product itself.

Some of these were simple and obvious things, for example: making sure visual cues were clear so that players knew what to do next or that proportions of objects needed to be as accurate as possible to real-world elements and constantly checked in-VR as units in game do not map to real-world measurements at all.

Other aspects were much more obscure and took some finessing...

### Positioning

Positioning of the HTC Vive came out of the box as a blueprint component. A blueprint component is a ready-made piece of visual code that is made with integration points (an API) ready to be incorporated into your game. It comes ready to inform your game on each tick on the position of each controller, which buttons have been pressed, the orientation of each controller, and other useful data. Unfortunately, one of the problems we ran into early on was that this component was never designed with multiplayer support in mind, a known bug with the engine itself that hadn't been resolved by the time of writing this blog post. As soon as we had two clients connected into the same session, the component would try to control both clients at the same time, so we had to implement our own solution.

Luckily, the Unreal engine had us covered. There was an API for listening to Motion Controllers per controller index (effectively, per player), so we could then only replicate that information to our servers selectively, thus isolating the data sent out to the server to the player in question.

As a side note, we also implemented a neat feature where we copied the position of the camera for each client, which is effectively the position of the VR headset, and placed a model of the player head. This gives the other players something to look at, and react to, in addition to just floating hands in space. It was a nice little feature and worked really well.

### Eyeballing is (sadly) the best way

Proportions in VR are everything. When you are walking around in a virtual world, the perception of space becomes paramount to the user. There is a lot to be said about this, and a lot of ideas about interesting gameplay could be explored when thinking about the relationship between size and space. For our purposes, we just wanted to get the dimensions as realistically as possible.

Initially we made great efforts in trying to keep every model in accurate measurements, but it quickly became apparent that it wouldn't work. As soon as we imported everything into the game engine, things lost their objectivity and manual tweaking ended up being the best way to go. We did, however, maintain a constant ratio to scale all elements to each other in order to maintain some consistency.

### Multiplayer, Sessions & Replication

One of the core features we wanted, and the one that took us longest to get right, was networked multiplayer support. UE4 has a robust built-in network support system, designed for AAA games. It's designed using a Client/Server architecture, and RPC (Remote Procedure Calls) via UDP (User Datagram Protocol). The engine gives the developer full control over how your code will be propagated over the network reliably as it uses a concept called "Authoritative Server", which essentially means that the server is always the single source of truth.

Understanding this client/server model was key to structuring our code properly and turned out to be the biggest challenge to us. Most of the documentation provided by Epic Games regarding the best practices and recommended approach of Networking fall into three categories: C++ code, Blueprints examples, and more academic conceptual topics.

In our specific case, we had one simple bug which disabled inputs from the client upon connection to the Host. It was a simple matter of asking the Server to enable inputs, in the Player controller upon connection. The catch was, that this needed to happen *on the server side, and inside the player controller, then replicated to every client*. This is something we assumed was done automatically, and was not described anywhere we could find anywhere on the documentation.

Getting started on networking is hard. C++ code was inaplicable to our case, so that was out. After reading and understanding the high level concepts, you naturally look at the examples and use them as a basis for your case. Sadly, we found that some example are incomplete, outdated, or don't work as expected. This is understandable, Epic Games is doing a laudable job in keeping up with the demand of an Open Source community, but it's definitely discouraging when you find these.

As you try to adapt those examples to your case, you often find that veering away slightly is enough to find yourself in a place where you simply can't find the answers to your problem. Forums are hard to navigate and don't have all the answers. There are numerous threads with varying degrees of knowledge and false answers which will take you down paths that just waste your time.

In addition, there's the problem where the community has now split. you will find answers to your problem in C++ flavor, but not in Blueprint flavor. Depending on your issue you can get some insight from a solution in another flavor, but it's a rare occurrence.

In general, UE4 is an extremely powerful and flexible engine. It is a beast. It can and will do anything you ask it to do, you just need to really understand *how* it works. That is the key. To do this effectively, you need time to learn it. Documentation helps tremendously, but at this stage Epic Games needs to catch up.

### Menus in 3D

One of the features that we wanted to achieve, but ultimately dropped, was fully interactable in-game menus. We wanted to be able to control all the UI from within the VR world so that the player wouldn't have to put the headset on and off every time they changed settings or paused the game, etc. Unfortunately, we realized this was easier said than done, and it quickly became one of the first features to hit the chopping block because we didn't have enough time to complete it. There were no built-in components within the UE4 engine that let us achieve this easily, so we would have to create our own, and no one had built a plugin to do this.

We did create a rough draft of this feature that did fully work. It functioned like this: the menu would be displayed in front of the user in 3D space, as a flat screen, the player would use the motion controller as a laser pointer of sorts and use the trigger to "click" on the buttons. The inner workings of it were complicated. We needed to do simple but convoluted math and logic to determine which button you intended to hit. It quickly became unwieldy, and refactoring it for a modular approach would have consumed precious development time that would've been better served on the game itself.

Off to the chopping block then.

## Final thoughts

This project was a first in many ways. First project using the HTC VIVE hardware. First project in the Unreal Engine 4. First multiplayer game. First project to use all in-house 3d assets and music.

It was an absolute blast to learn and discover that we have the capability to build VR software well, and can't wait to see what sorts of incredible experiences we can cook up to amaze our clients with!