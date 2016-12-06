---
title: 'Early days in VR'
author: 'Rodrigo Thauby'
description: 'Something'
---

There are a lot of gamers here in our team. We've played all the big games together online: Counter-Strike, Diablo, GTA, Overwatch, you name it. Naturally some of us have spent a fair amount delving into game development as more than just a hobby as well.

Further learning and exploration led us to try our hand at VR. We came up with the idea of building a very simple game; and what could be simpler than throwing bean bags into a hole? So we set out to build it. We thought it would also be a good idea to try making it multiplayer, because why make it too easy on ourselves?

We bought 2 HTC Vives and got to work.

I had personally been developing in the Unreal Engine for over a year, but mostly building some experiments and demos. I was familiar enough with the following work pipeline: Blender to Substance Painter to Unreal Engine, but this would be the first time I would try to build something end-to-end, towards a finished product.

We have had some experience using Unity and Unreal in the past and were comfortable using both. We analyzed how complex it would've been to integrate the HTC Vive into either engine, and determined that it was well supported on both, so the decision then was based on our comfort level with leveraging either engine. Furthermore, we thought we could achieve a higher degree of visual fidelity and immersion with the Unreal Engine over Unity with little effort.

## Easy stuff

We were already very comfortable with the asset creation pipeline of mesh creation in Blender, texturing in Substance Designer/Painter and bringing all those assets into UE4. There isn't much worth note here aside from a few pretty screenshots, enjoy!

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

There were many challenges that we faced when we set out to build this game, many of which were unknown to us from the get-go and were to be discovered as we progressed with the development process, learned the limitations of the engine and discovered what we wanted out of the product itself. Some of these were simple and obvious things, for example: making sure visual cues were clear so that players knew what to do next, proportions of objects needed to be as accurate as possible to real-world elements and constantly checked in-VR as units in game do not map to real-world measurements at all.

Other aspects were much more obscure and took some finessing.

### Positioning

Positioning of the HTC Vive came out of the box as a blueprint component. A blueprint component is a ready-made piece of visual code that is made with integration points (an API) ready to be incorporated into your game. It comes ready to inform your game on each tick on the position of each controller, which buttons have been pressed, the orientation of each controller, and other useful data. Unfortunately, one of the problems we ran into early on was that this component was never designed with multiplayer support in mind. As soon as we had two clients connected into the same session, the component would try to control both clients at the same time, so we had to implement our own solution.

Luckily, the Unreal engine had us covered. There was an API for listening to Motion Controllers per controller index (effectively, per player), so we could then only replicate that information to our servers selectively, thus isolating the data sent out to the server to the player in question.

As a side note, we also implemented a neat feature where we copied the position of the camera for each client, which is effectively the position of the VR headset, and placed a model of the player head. This gives the other players something to look at, and react to, in addition to just floating hands in space. It was a nice little feature and worked really well.

### Eyeballing is (sadly) the best way

Proportions in VR are everything. Initially we made great efforts in trying to keep every model in accurate meassurments, but it quickly became apparent that it wouldn't work. As soon as we imported everything into the game engine, things lose their objectivity and manual tweaking is the best way to go. We did, however, maintain a constant ratio to scale all elements to each other in order to maintain some consistency.

### Menus in 3D

### Multiplayer, Sessions & Replication