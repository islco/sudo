---
title: "Investigating Browersify: The Development Tool That Lets You Write Modular Code For Use In Browser"
author: Johnny Ray Austin
description: "How we manage the multitude of files associated with using a framework like Angular"
---

A while back, the engineering team adopted [AngularJS](https://angularjs.org/) as the front end JavaScript framework of choice. Not every project we work on requires a framework like Angular, but when we need one — it's where we go. This post, however isn't about Angular itself — or why we chose it — it's about how we manage the multitude of files associated with using such a framework. Every FED (front end developer) knows that simply using a separate script tag to include all files does not scale very well. Most take to simple concatenation, allowing them to use one js file for their app code. This also works, but can get out of hand and also forces you to either pollute the window namespace or create your own namespace in order to access various components outside of their respective files.

Our development team decided that a more modular approach was appropriate to solving this problem, so we turned to [Browserify](http://browserify.org/). Browserify brings [node.js](https://nodejs.org/en/) style require statements to the browser. We can write code that looks like this:

```

// mainCtrl.js
(function(angular){
  module.exports = ['$scope', function($scope){
    $scope.theThings = ['thing1', 'thing2', 'thing3'];
  }];
}(window.angular));

// fooCtrl.js
(function(angular){
  module.exports = ['$scope', function($scope){
    $scope.foo = 'bar';
  }];
}(window.angular));

// controllers.js
(function(angular){
  var controllers = {
    MainCtrl: require('./mainCtrl'),
    FooCtrl: require('./fooCtrl')
  };

  // a utility module to dynamically attach modules
  require('./moduleUtils')
    .forModule('myApp.controllers')
    .setType('controller')
    .injectAll(controllers);
}(window.angular));

// finally in app.js
(function(angular){
  angular.module('myApp', [
    'myApp.controllers',
    'myApp.services',
    // …. and so on
  ]);
}(window.angular));
```

Using a build system, we point Browserify to app.js and that's it! Another benefit to using Browserify is that many node modules are [automatically compatible](https://github.com/substack/node-browserify#compatibility) and can be used in the browser. At the end of the day, Browserify is the best tool for allowing us to handle code in different files and keeping it all modular.
