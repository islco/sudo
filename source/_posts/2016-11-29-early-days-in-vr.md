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

{% asset_img barn.png 'A barn' %}

{% asset_img house.png 'A country house' %}

{% asset_img picnic.png 'A picnic table' %}

{% asset_img platform.png 'A cornhole platform' %}

## Challenges

- Multiplayer
- Sessions
- Replication
- Positioning
- Menus in 3D