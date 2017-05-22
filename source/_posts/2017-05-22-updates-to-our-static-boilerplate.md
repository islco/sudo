---
title: Updates to our static boilerplate
author: Thomas Degry
description: "Why we updated our open-source static boilerplate."
---

Most of the new projects we start at ISL rely on one of our boilerplates. For our Django projects that's [mo-django](https://github.com/istrategylabs/mo-django) and for our static projects we use [mo-static](https://github.com/istrategylabs/mo-static). Although these boilerplates are developed open-source, their primary use case is internal use so our developers can hit the ground running when starting a new project. This means we aren't aiming to be a go-to solution for everyone out there but focus on our needs.

## Some Background
mo-static has served us well over the past years. It has been the starting point of numorous projects and our developers loved it. But at the same time some it's default dependencies were starting to become a little old fashioned thanks to our rapidly evolving industry. It was powered by Gulp, Browserify to bundle Javscript, Foundation CSS and Javascript, jQuery (because Foundation Javascript relies on it) and Sass.

## The Changes
Andrew's article ["what you should bring to a code review"](/what-you-should-bring-to-a-code-review/) talks about AMOP, an acronym came up with as a team, our team tries to write and evaluate code with those principles in mind. We had to admit that the mo-static architecture as described above could do a better job in helping us achieve those goals. Especially the **P**erformance part could be better out of the box.


#### CSS
Since Foundation's CSS is pretty expansive started looking for alternatives. The team didn't often use the components Foundation shipped with and on top of that we found ourself fighting the styles it applied to global elements like links, lists and paragraphs. So our alternative was ideally lighter and less aggressive with margins and paddings on global html tags. In the past we had used [SUIT CSS](https://suitcss.github.io/), it's a CSS preprocessor that relies on Postcss instead of Sass and it checked both of those boxes. It's super modular, a lot lighter and has less of a "bootstrap" feel to it. It's syntax also isn't too different to the [BEM](http://getbem.com/introduction/) syntax we had been using up until now in sass. Here's how Foundation and SUIT CSS compare in file size.

| Resource       | Build | Minified | Minified & Gzip |
|----------------|-------|----------|-----------------|
| Foundation CSS |  294K |    34K   |       6.6K      |
| SUIT CSS       |  44K  |    20K   |       3.9K      |


#### Javascript
While we didn't love Foundation's CSS, it's Javscript side even a bigger issue. Foundation requires jQuery so before we could even initialize Foundation we also had to include the entire jQuery library. But since Foundation doesn't support jQuery 3.x yet, for a lot of it's plugins we also had to include `jquery-migrate`. All of this meant an exorbitant amount of Kilobytes again. Especially considering we, just as a lot of other developers, are trying to move away from jQuery and try to write as much vanilla Javascript as possible. There's no denying that there are useful plugins in the Foundation Javascript toolbelt but often there are lightweight alternatives available that don't rely on this many dependencies. By removing Foundation we wanted to push our front-end developers to use those alternatives.

On a higher level there were two other things we wanted to achieve with this update:
- Add support for yarn
- Code splitting our JS into multiple bundles
- Tree shaking for dead-code elimination (you can read more about [tree shaking here](https://webpack.js.org/guides/tree-shaking/))

Since Browserify's code splitting abilities are limited and it doesn't support tree shaking it seemed like a good time to make the switch to Webpack. Our `webpack.config.js` file is rather simple at the moment, and we haven't implemented tree shaking just yet, but it's ready to expand on for when a project requires a more complex configuration.


## Conclusion
This was the biggest update to mo-static we have ever done. Next to everything mentioned above we also switched out `nconf` for `node-convict` [by Mozilla](https://github.com/mozilla/node-convict) to pass environment variables to our Javascript. Needless to say that we are very excited to start building awesome projects with this rejuvenated boilerplate. I'm personally most excited that we are finally moving away from Foundation! Feel free to check out [the merged PR here](https://github.com/istrategylabs/mo-static/pull/77) and play with it!

## The Future
There are still [some open issues](https://github.com/istrategylabs/mo-static/issues) of things we'd like to fix. The next big milestone might be killing Gulp but for now this feels like a great place to evaluate what we have done and make changes if anything doesn't work as we had hoped it would. All of these front-end changes will also make it into our [mo-django](https://github.com/istrategylabs/mo-django) boilerplate so the tooling on both boilerplates is identical, that way it's easier for developers to switch projects!
