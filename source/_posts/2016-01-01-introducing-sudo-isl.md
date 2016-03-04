---
title: Introducing sudo ISL
author: Joseph Abrahams
description: Introducing ISL's new Engineering Blog
image:
---

Excellent work getting started on this blog post!

1. Fill out the following front matter: `title`, `author`, `description`. Be sure to wrap these in quotes if they contain special characters.
   ```
   title: "Javascript: Vanilla Edition"
   author: Olivia Cheng
   description: "Here's a short primer on Javascript: an lil' tale of luck and adventure. The world says hello."
   ```
2. Want a custom slug for your post? Add a permalink to the front matter.
   ```
   permalink: my-unique-slug
   ```
3. Start writing your new post! It's (mostly) just plain [markdown](https://daringfireball.net/projects/markdown/syntax) from here on out.
4. When you're finished, make a pull request, and have someone review your post.
5. Get a nice cold drink, you deserve it.


## Images

If you have images you want to use in your post, just add them to the corresponding assets directory for this post. Then add your image to the post like so:

<pre>
{% asset_img isl-gulp-liz.jpg 'Liz, an ISL engineer writing code' %}
</pre>

## Code

Here's a good looking code snippet. You can specify what language to use if the [syntax highlighter](https://highlightjs.org) doesn't pick it up.

```javascript
function hello() {
  console.log('Hello World');
}
```

Look forward to seeing your post live on [sudo.isl.co](https://sudo.isl.co)!
