---
title: "Operation: Iteration Obliteration"
author: Johnny Ray Austin
description: "Functional programming is a big topic - how exactly, does one embrace functional programming? At ISL, we've decided to take an incremental approach."
---

### *And also death to side effects.*

Let's get right into it. ISL is embracing the functional side of JavaScript. Functional programming is a big topic  - how exactly, does one "embrace" functional programming? We've decided to take an incremental approach. One piece of low-hanging fruit is to favor [higher-order functions](https://en.wikipedia.org/wiki/Higher-order_function) (map, reduce) over iterative constructs such as for-loops. Let's look at an example. If we want to create a new array of values based on an existing array, one's first instinct might be to do so this way:

```
'use strict';

let arr = ['beep', 'boop', 'bop'];

function transform() {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = `${arr[i]}__`;
  }
}

transform();
console.log(arr); // [ 'beep__', 'boop__', 'bop__' ]
```

This certainly achieves the goal of transforming an array but it produces what's known as side effects. That is to say, the function `transform()` reaches outside of its functional scope, to fetch a reference to `arr` and then modifies it. What if this file is several hundred lines long (that's a different post) and an unsuspecting junior dev attempts to use the `arr` function? If she doesn't know that `transform()` exists, she may use `arr` thinking that the contents are one thing, but have indeed been changed by `transform()`.

A key principle of functional programming is to, as much as possible, prevent side effects such as the one described above. Data goes in, new data comes out. One way to accomplish that would be:

```
'use strict';

let arr = ['beep', 'boop', 'bop'];

function transform(anArr) {
  let arr2 = [];
  for (let i = 0; i < anArr.length; i++) {
    arr2[i] = `${anArr[i]}__`;
  }
  return arr2;
}

const arr2 = transform(arr);
console.log(arr); // [ 'beep', 'boop', 'bop' ]
console.log(arr2); // [ 'beep__', 'boop__', 'bop__' ]
```

And so, we've performed a non-destructive operation which gives us a transformed version of our original data and keeps the original data in tact. We're done, right? Not quite. We had to add a new variable declaration and then a return statement on a new line. I don't know about you, but my favorite type of refactoring results in less code, not more. In general, there's "cruft code" that doesn't add to the expressiveness of what we're trying to accomplish. Try this instead:

```
'use strict';

let arr = ['beep', 'boop', 'bop'];

function transform(arr2) {
  return arr2
    .map((item) => `${item}__`);
}

const arr2 = transform(arr);

console.log(arr2); // [ 'beep__', 'boop__', 'bop__' ]
console.log(arr); // [ 'beep', 'boop', 'bop' ]
```

Need more flexibility on that transform? Use a closure:

```
'use strict';

let arr = ['beep', 'boop', 'bop'];

function transform(appendage) {
  return (item) => `${item}${appendage}`;
}

const x = '__';
const arr2 = arr.map(transform(x));

console.log(arr2); // [ 'beep__', 'boop__', 'bop__' ]
console.log(arr); // [ 'beep', 'boop', 'bop' ]
```

Or if you really want to go nuts:

```
'use strict';

let arr = ['beep', 'boop', 'bop'];

function transform(a, thing, times) {
  return (item) => `${item}${a(thing, times)}`;
}

const x = (thing, t) => thing.repeat(t);
const arr2 = arr.map(transform(x, '_', 2));

console.log(arr2); // [ 'beep__', 'boop__', 'bop__' ]
console.log(arr); // [ 'beep', 'boop', 'bop' ]
```

As you can see, even taking tiny steps towards functional JS yields much more expressive code and (more importantly) much more *testable* code. This is just the beginning, we'll keep you posted!
