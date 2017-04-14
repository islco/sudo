---
title: What You Should Bring to a Code Review
author: Andrew Krawchyk
description:
---

<pre>
{% asset_img stupid.png "If it's stupid, but it works, it ain't stupid" %}
</pre>

Code reviews are an important part of any developer's career. It's important to be prepared to receive feedback from your peers, but also to bring new ideas to the table for everyone to learn from.

At first it can feel daunting to open up your editor and get extra eyes on your precious 1's and 0's. Even if this makes you cringe with uncertainty or you're apprehensive of the feedback you'll receive, I'd recommend you reframe your idea of what a code review is for.

Sure, you're offering up your code to the team to ask for feedback to improve your approach or get some help on a problem area, but that's not the only reason you're sharing code. Additionally, consider the ideas you can share to help other developers around you grow. I read other's source code on Github all the time (seriously, it's a [gold mine](https://jakubdziworski.github.io/tools/2016/08/26/github-code-advances-search-programmers-goldmine.html)) to get ideas from other developers that have already tackled the same problems I'm currently working through. Or maybe a teammate is working on a similar problem you didn't know about, and now you can put your heads together to save time!

It's important to remember your code is not you. Although code output is a form of self-expression, even an art, it's a representation of your ideas, not your personal self. That means a healthy code review should never be personal. It's about working together toward a solution that works best for the problem at hand and discussing the trade-offs that come with the approach being presented. One thing to remember that can help assuage your concerns with sharing is that everything is a trade-off. Anyone offering feedback needs to understand their ideas also come with trade-offs and should be discussed just the same.

A helpful way to keep this feedback objective is to define a set of criteria ahead of time to help frame everyone's input. There are [many](https://www.ibm.com/developerworks/rational/library/11-proven-practices-for-peer-review/) [examples](https://blog.fogcreek.com/increase-defect-detection-with-our-code-review-checklist-example/) of [these](https://msdn.microsoft.com/en-us/library/ms182019.aspx) on the web so take some time to figure out what matters within the context of your team. For example, we made an acronym to make this criteria easy to remember during frontend code reviews:

* A - Accessible, is the code accessible?
* M - Maintainable, can the code be easily reasoned about?
* O - Organized, does the naming and file structure of the code make sense?
* P - Performant, are there any performance issues introduced by the code?

"AMOP" is silly, but it works because it's easy to remember. As a frontend team, we have code reviews every Thursday morning and pretty much every time someone brings up the acronym. Our UX designers are even interested in making an "AMOP" brand ;) Plus this keeps the atmosphere light and fun, as it should be.
