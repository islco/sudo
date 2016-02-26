---
title: {{ title }}
author:
description:
image:
---


Excellent work getting started on this blog post!

1. Fill out the following front matter: `title`, `author`, `description`. Be sure to wrap these in quotes if they contain special characters.
   ```
   title: "Javascript: Vanilla Edition"
   author: Olivia Cheng
   description: "Here's a short primer on Javascript: an lil' tale of luck and adventure. The world says hello."
   ```
2. Optionally, override the default open graph image with your own. This image should be added to the corresponding assets directory created for this markdown file.
   ```
   image: custom-image.jpg
   ```
3. Want a custom slug for your post? Add a permalink to the front matter.
   ```
   permalink: my-unique-slug
   ```
4. Start writing your new post (and remove all this)! It's just plain [markdown](https://daringfireball.net/projects/markdown/syntax) from here on out.
5. When you get done, make a pull request, and have someone review your post.
6. Get a nice cold drink, you deserve it.


---

## A title for a new section

If you have images you want to use in your post, just add them to the corresponding assets directory for this post. Then add your image to the post like so:
`![Don't forget the alt text](my-new-image.jpg)`
![Don't forget the alt text](http://placehold.it/800x400)

Here's some good looking code snippets. You can specify what language to use if the [syntax highlighter](https://highlightjs.org) doesn't pick it up.

```javascript
function hello() {
  console.log('Hello World');
}
```

```
.slide {
    background-position: center center;
    background-size: cover;
    min-height: 100vh;
    padding-top: 6rem;

    @media #{breakpoint(large)} and (min-height: 500px) {
        height: 100vh;
        padding-top: 0;
    }
}

```

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.

Look forward to seeing your post live on [sudo.isl.co](http://sudo.isl.co)!
