---
title: How to Use CSS Variables for Dynamic Theming
author: Julie Bacon
description: Leverage the power of CSS custom properties (variables) and JavaScript to create a dynamic theme for your website.
---

CSS pre-processors have been in our web development toolbelts for years. Whether you’re a proponent of SASS, LESS or other major [pre-processors](https://medium.com/@cabot_solutions/css-preprocessors-effective-tools-for-faster-styling-of-web-pages-and-user-interfaces-6ed4737a9804), these tools might be an integral part of your workflow. We use pre-processors to store everything from global font-families and sizes to color palettes. When working on a large codebase, this makes refactoring a breeze and saves you hours of headache searching through a messy codebase to change repetitive values. And while pre-processors are powerful tools, they have some downsides. Developers cannot dynamically change values, the developer has to learn *another* new syntax, and variables cannot be read by JavaScript. Enter: [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).

### Custom Properties in a Nutshell

CSS custom properties allow you to store values in variables and use them across your site to speed up development and keep code maintainable. And even better, they’re [widely supported](https://caniuse.com/#search=css%20variables) across browsers.

### Custom Properties IRL

We decided to use CSS custom properties to create a fun interaction on our latest project, [Fore_Front](https://4front.io/), a website promoting a front-end developer speaker series. When a user visits the web page, the primary and secondary colors needed to change pseudo-randomly from a set of predefined color palettes.

To make this even more fun, we threw in the use of local storage to ensure that the user did not encounter the same color palette two consecutive times or between pages. Keeping. It. Fresh.

You too can achieve dynamic themes in 3 easy steps:


## 1. Declare CSS Custom Properties
Starting in our root css, we declare our custom properties using the `--variable-name` syntax:

```css
:root {
    --primary-color: #4554A1;
    --secondary-color: #FFFDEB;
}
```

Throughout our code, we use the two variables accordingly, just like we would if we were using a traditional pre-processor such as the SASS `$variable-name` syntax. We use the `var()` function to access a specific variable.

```css
body {
    background-color: var(--secondary-color);
    color: var(--primary-color);
}
```

Now we have a website color palette entirely derived from two CSS custom properties. But what if we want to dynamically change the interaction?

## 2. Choose a New Color with Local Storage
With the power of local storage, we can ensure a new experience on each page refresh.

First we’ll create an array of color objects.

```javascript
const colorList = [
  {
    color1: '#FEFFD3',
    color2: '#E56258'
  },
  {
    color1: '#E56258',
    color2: '#FEFFD3'
  },
 ...
]
```

Next, we’ll write a function to check which color was used last and select a new color object at random. We’ll store the new color in local storage.

```javascript
function changeColor() {
  const lastColor = localStorage.getItem('lastColor') || -1
  let randomColor = -1

  while(lastColor == randomColor || randomColor === -1) {
    randomColor = Math.floor(Math.random() * colorList.length)
  }

  localStorage.setItem('lastColor', randomColor)
}
```

## 3. Set the CSS Variable with JavaScript
The last step is to set the `--primary-color` and `--secondary-color` properties to our newly selected theme.

```javascript
document.body.style.setProperty('--primary-color', colorList[randomColor].color1)
document.body.style.setProperty('--secondary-color', colorList[randomColor].color2)
```

And voila, you’ve got a dynamic color palette that changes each time you visit the page, without showing the same consecutive palette. Want to know what’s even more fun? We can easily add an easter egg in the top right corner that simply calls the changeColor() function on click, for all you front-end nerds out there.

```javascript
const btn = document.getElementById('colorpicker')
btn.addEventListener('click', function(){
  changeColor()
})
```

It's an ultra fun easter-egg. Click it, I dare you.

How are you using CSS custom properties to build delightful interactions? Email me at [julie@isl.co](mailto:julie@isl.co).
