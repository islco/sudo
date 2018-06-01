---
title: How to Optimize Fonts
author: Marissa Halpert
description: When font files are too big for a project, what do you do?
---

At ISL, we like to experiment with our capabilities. That's why when our sister company, JWT Atlanta asked us to help them create ad banners for their client, we said yes! These ad banners were exciting for us because they were a little different than the website builds we typically do. While we always care about performance and optimization, it was especially important for these ad banners. They also let us flex our CSS Animations muscle. Keep an eye on [ESPN](https://www.espn.com) for our ad banners!

## Background Information

ESPN sets strict [guidelines](http://www.espn.com/adspecs/guidelines/en/index.html) for all ad banners served on their site. The most noteable is the file size restriction. Each ad banner had to be under the file size limit (50KB, 150KB, or 200KB based on the ad size) including HTML, CSS, and assets. When you have 4 fonts and a few images, it's easy to push the bounds. I knew we'd be close to the limit from the beginning. The images were easy to compress thanks to [tinypng](https://tinypng.com/). I converted the fonts to `.woff2` format (the most compressed of the formats). At this point, we were just barely under the limit but okay.

## The Problem

`.woff2` is not supported in IE11. (See [caniuse.com](https://caniuse.com/#search=woff2)) The other font file formats were too big to stay under the limit.

## The Solution

I searched the internet for solutions with no luck. We talked about using fallback system fonts, but none of them were in the client's brand guidelines, and they wouldn't be a good experience. Our fonts weren't on [Google Fonts](https://fonts.google.com/), so that wasn't an option.

Then, our CTO, Jeremy, had an idea - let's strip all of the non-alpha special characters out of the font file. We weren't using them anyways, so why include them?

Here's how I did it:
1. Download and install [FontForge](https://fontforge.github.io/en-US/). (We used homebrew.)
2. Open the font file in FontForge.
3. `Encoding` -> `Reencode` -> `ISO 8859-1 (Latin1)`
4. To cut it down even more: click and drag to highlight characters that you do not want. `Encoding` -> `Detach & Remove Glyphs...` -> Confirm by clicking `Remove`
5. `Encoding` -> `Remove Unused Slots`
6. To save your font: `File` -> `Generate Fonts...`
7. Choose your file format (I recommend Web Open Font - woff).
8. Click `Generate` and confirm the warnings.

Voila! You should see that your new font file is significantly smaller.

{% asset_img fontforge.png 'FontForge' %}


## Questions?

Have questions or want to chat more about this? Need some ad banners? Email me at marissa@isl.co or tweet me [@marissahalpert](https://twitter.com/marissahalpert).
