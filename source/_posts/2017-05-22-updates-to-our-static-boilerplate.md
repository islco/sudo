---
title: Updates to our static boilerplate
author: Thomas Degry
description: "Why we updated our open-source static boilerplate."
---

Most of the new projects we start at ISL rely on one of our boilerplates: for our Django projects we use [mo-django](https://github.com/istrategylabs/mo-django) and for our static projects we use [mo-static](https://github.com/istrategylabs/mo-static). Although these boilerplates are developed in the open, we primarily use them internally so that our developers can hit the ground running when starting a new project. We aren't aiming to be a go-to solution for everyone, our goal is to focus on our needs.

## Some Background
mo-static has served us well over the past few years. It has been the starting point of numerous projects and our developers loved it. But at the same time, due to rapidly evolving industry standards, some of it's default dependencies were starting to become a little old fashioned. It was powered by Gulp, Browserify to bundle Javscript, Foundation CSS and JavaScript, jQuery (because Foundation JavaScript relies on it), and Sass.

## The Changes
Andrew's article ["what you should bring to a code review"](/what-you-should-bring-to-a-code-review/) talks about AMOP, an acronym we came up with as a team. Our team tries to write and evaluate code with those principles in mind. We had to admit that the mo-static architecture as described above could do a better job in helping us achieve those goals, especially since the **A**ccessibility and **P**erformance parts could be better out of the box.


### CSS
Since Foundation's CSS is pretty expansive, we started looking for alternatives. The team didn't often use the components included in Foundation, and on top of that we found ourselves fighting the styles it applied to global elements like links, lists and paragraphs. So our alternative was ideally lighter and less aggressive with margins and paddings on global html tags. In the past, we had used [SUIT CSS](https://suitcss.github.io/), it's a CSS preprocessor that relies on Postcss instead of Sass and it checked both of those boxes. It's super modular, a lot lighter and has less of a "bootstrap" feel to it. Also, it's syntax isn't too different to the [BEM](http://getbem.com/introduction/) syntax we had been using up until now in Sass. Below, you can see how Foundation and SUIT CSS compare in file size.

| Resource       | Build | Minified | Minified & Gzip |
|----------------|-------|----------|-----------------|
| Foundation CSS |  294K |    34K   |       6.6K      |
| SUIT CSS       |  44K  |    20K   |       3.9K      |


### JavaScript
While we didn't love Foundation's CSS, its JavaScript side an even bigger issue. Foundation requires jQuery so before we could even initialize Foundation we also had to include the entire jQuery library. But since Foundation doesn't support jQuery 3.x yet (although they are talking about it as you can see in [this issue](https://github.com/zurb/foundation-sites/issues/8834)), for a lot of its plugins, we also had to include `jquery-migrate`. All of this meant an exorbitant volume of Kilobytes (again). We, just like many other developers, are trying to move away from jQuery and write as much vanilla JavaScript as possible. There's no denying that there are useful plugins in the Foundation JavaScript toolbelt, but often there are lightweight alternatives available that don't rely on this many dependencies. By removing Foundation, we're aiming to push our front-end developers to use those alternatives.

On a higher level there were two other things we wanted to achieve with this update:
- Add support for yarn
- Code splitting our JS into multiple bundles
- Tree shaking for dead-code elimination (you can read more about [tree shaking here](https://webpack.js.org/guides/tree-shaking/))

Since Browserify's code splitting abilities are limited and doesn't support tree shaking, it seemed like a good time to make the switch to Webpack. Our `webpack.config.js` file is rather simple at the moment, but it's ready to be expanded for when a project requires a more complex configuration. If you're interested in a comparison between module bundlers, Webpack has a great one [on their website](https://webpack.js.org/guides/comparison/).

### Environment Configuration
Sometimes we want to pass environment variables to our client side. Up until now we were using `nconf` to achieve exactly that but we switched it out for `node-convict` [by Mozilla](https://github.com/mozilla/node-convict). Key advantages of `node-convict` are the ability to define some basic validation on these variables and to write a few sentences of documentation for each variable. That way we can document decisions for our future selves and coworkers, adding to the **M**aintainability of the AMOP acronym.


### Testing
We added testing to the boilerplate as well as including default tests for the generated projects. These boilerplate tests are integrated into CircleCi to help verify the changes we make to the project template that still produces a valid generated project.

For the project tests, it's difficult to provide out-of-the-box tests since the projects will differ wildly from each other. Regardless, we still wanted an easy way for our devs to get started with testing and have a baseline for continuous integration. That means we had to pick default tests that apply to ALL static sites, and the first obvious starter was accessibility testing. So, we added [nightwatch-cucumber](https://github.com/mucsi96/nightwatch-cucumber) (to provide Gherkin-style tests) and [axe-core](https://github.com/dequelabs/axe-core) which verifies our pages conform to WCAG 2.0 AA standards. Axe provides reliable accessibility testing since it strives for [zero false-positives](https://github.com/dequelabs/axe-core#manifesto), and is highly configurable so we can tweak the accessibility tests depending on the requirements of our projects.


## Conclusion
This was the biggest update to mo-static we have ever done. Needless to say that we are very excited to start building awesome projects with this rejuvenated boilerplate. I'm personally most excited that we are finally moving away from Foundation! Feel free to check out [the merged PR here](https://github.com/istrategylabs/mo-static/pull/77) and play with it!

## The Future
There are still [some open issues](https://github.com/istrategylabs/mo-static/issues) of things we'd like to fix. The next big milestone might be killing Gulp but for now this feels like a great place to evaluate what we have done and make changes if anything doesn't work as we had hoped it would. All of these front-end changes will also make it into our [mo-django](https://github.com/istrategylabs/mo-django) boilerplate so the tooling on both boilerplates is identical, that way it's easier for developers to switch projects!
