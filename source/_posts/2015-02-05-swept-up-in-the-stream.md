---
title: "Swept up in the stream: 5 ways ISL used Gulp to improve our process"
permalink: 5-ways-isl-used-gulp-to-improve-our-process
author: Andrew Krawchyk
description: "After modifying our existing build process to adhere to the Gulp way, we saw a drastic improvement in overall build speed, on the order of several seconds, and near instant rebuilds for live reloading during development."
image: isl-gulp-liz.jpg
---

ISL recently switched our front-end build system from Grunt to Gulp. Our primary motivations for switching are Gulp’s preference for code over configuration, node streams, and asynchronous tasks by default. After modifying our existing build process to adhere to the Gulp way, we saw a drastic improvement in overall build speed, on the order of several seconds, and near instant rebuilds for live reloading during development.

![An ISL engineer writing code](isl-gulp-computer.png)

By adopting Gulp we’re actually scripting and coding our build process, unlike Grunt where we merely configured tasks. For example, if you want to tap into a Gulp stream and transform a file using plain old vanilla JavaScript, you can. It enables developers to customize their build workflow much easier, and the streaming paradigm works well since we’re literally just dealing with text files.

Gulp streams mimic the paradigm of Unix pipelines and redirection that we love so much. Combining this with Gulp’s asynchronous task execution powers fast builds with less IO meaning fewer file writes and less time sunk into waiting for builds to finish. By contrast, although Grunt allows async task implementations, they require more configuration and code resulting in unnecessary overhead for the developer. Also, Grunt async tasks often require writing of intermediate files before passing control to a new module for transformations, resulting in more time spent writing files and less time actually performing transformations.

We did take advantage of run-sequence to better control task execution order (which will be baked into Gulp 4 with series and parallel), but we run all build tasks in parallel and only use this for pre and post-build tasks like cleaning and versioning.

While we probably could have accomplished these changes by refactoring our Grunt workflow, we decided that time would be better spent reevaluating the entire system.

![Liz, an ISL engineer writing code](isl-gulp-liz.jpg)

## How we switched

First, we converted our Gruntfile, task by task, over to Gulp tasks. We simplified a lot of things along the way, and began converting our projects to a new build process built on Gulp.

After our initial switch to Gulp things still felt a bit Grunty — it was almost a task-by-task replica. We recognized that we needed to refactor to the streaming paradigm to really take advantage of Gulp’s asynchronous task execution. We also wanted to extract the configuration out of the Gulpfile for a few reasons. Since deployment depends on a stable build process, we discourage edits to our base project Gulpfile. Instead, we abstracted all configuration out of the Gulpfile, and require it in a global config variable to be used by all Gulp tasks. This allows our developers to change settings on a project-by-project basis, while still being able to depend on reliable deployments.

Note, we follow a convention of suffixing each path we write in our settings with a forward slash. Following small conventions like these helps later when debugging, writing new tasks, and composing custom paths.

```
/** N.B. All paths end with / */
var minimist = require('minimist');
var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'local' }
};

var options = minimist(process.argv.slice(2), knownOptions);
var src = 'src/';
var dist = 'dist/';
var isCompressing = (options.env === 'staging' || options.env === 'production');
var isDebugging = (options.env !== 'staging' && options.env !== 'production');
var isStyleguiding = true; // change this to (options.env !== '<env>' [&&...]) to disable on specific environments

module.exports = {
  // environment
  compressing: isCompressing,
  debugging: isDebugging,
  styleguiding: isStyleguiding,
  ...

  // paths
  src: src,
  dist: dist,
  css: {
    glob: '**/*.css',
    dist: dist + 'css/',
    src: src + 'css/'
  },
  js: {
    src: src + 'js/',
    dist: dist + 'js/',
    glob: '**/*.js'
  },
  ...

  // modules
  autoprefixer: {
    browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
  },
  bower: { // aka main-bower-files
    bowerDirectory: src + 'bower_components/'
  },
  nodeSass: {
    errLogToConsole: true,
    includePaths: [
      src + 'bower_components/foundation/scss/'
    ],
    sourcemap: isDebugging
  }
  ...
};
```

We also wanted to simplify the build process since we had a lot of extra tasks from the Gruntfile that made up a complex naming scheme that was difficult to follow. Instead of using different names for the same types of tasks — e.g. compile:js, compile:css, copy:texts, copy:fonts — we now have one task for each type of asset, indicating the type of asset they are responsible for outputting.  We ended up with  clear and concise task names that are obvious and easy to remember:
`'clean', 'html', 'css', 'js', 'fonts', 'images', 'extras', 'styleguide', 'rev'`

Each task is configured based on the settings file and can perform different operations on streams based on these settings. For example, the rev task, which post-processes assets, can optionally compress files based on the compressing variable in the config file.


## Tricks that helped us out

Manipulating these text streams and organizing the assets into their respective directories and switching compressing and linting options wasn’t easy at first. Abstracting the configuration to a separate file helped with these manipulations and there are many other tricks that helped us out: filtering streams, conditionally operating on streams, sending streams through different pipe channels, joining streams, and asynchronously operating on multiple streams. Check out this gulp cheatsheet for a helpful visual guide to some of these.

Note, all gulp plugins are loaded with gulp-load-plugins. You can define any variable name to reference these plugins, and in the following code snippets we use the dollar sign, `$`, for this. So, no, that is not jQuery in our gulpfile!

## Configuration
Use when: You want to separate configuration from gulp tasks.
Since our configuration is a plain JavaScript object, we can flexibly make settings for all kinds of tasks:

```
var config = require('./config.js');
var $ = require('gulp-load-plugins')({ lazy: false });

gulp.task('html', function() {
  return gulp.src( [config.src + config.html.glob, '!' + config.bower.bowerDirectory + '**'] )
  ...
  .pipe( gulp.dest(config.dist) );
});

gulp.task('css', function () {
  .pipe( $.sourcemaps.init() )
  .pipe( $.sass(config.nodeSass) )
  .pipe( $.autoprefixer(config.autoprefixer) )
  .pipe( $.sourcemaps.write() )
  .pipe( gulp.dest(config.css.dist) );
});
```

## Filtering streams

Use when: You need to operate on a subset of a stream based on a glob.
To focus using modules on a subset of files in a stream, we can use a couple of different modules to filter files from Gulp streams.
First up, gulp-if is a module that allows you to conditionally operate on files based on globs. An example of this in use is for filtering font files from all bower components:

```
return gulp.src( require('main-bower-files')({ paths: config.bower }), { read: false } )
.pipe( $.if(config.fonts.glob, gulp.dest(config.fonts.dist)) );
```

Next, we use gulp-filter to narrow the scope of a stream, perform a few operations, and return to the original stream’s state when we’re done. We use this to avoid linting vendor files in our source directory — for the inevitable script that we need to include manually for some reason:

```
var vendorFilter = $.filter(['*', '!' + config.js.src + 'vendor/**']);

return gulp.src( [config.js.src + config.js.glob] )
.pipe( vendorFilter )  // avoid hinting assets/js/vendor files
.pipe( $.jshint() )
...
.pipe( vendorFilter.restore() ) // restore assets/js/vendor files to be copied to dist
.pipe( gulp.dest(config.js.dist) ); 
 ```

 ## Conditionally operate on streams
 Use when: You need to perform operations based on a boolean.

 Back up to the plate is gulp-if. Along with filtering by glob, this module is useful for conditionally operating on streams based on a boolean. Since we have a lot of booleans in our configuration variable, we use this all the time to transform our files in different ways based on environment. For example, we may not want source maps to be generated for production deploys, but we do for development. Or we may want to compress asset files only on production to make debugging easier on development:

```
 return gulp.src( config.dist + '**/*' )
.pipe( $.if( config.compressing, compressChannel() ))
...
```

## Sending streams through different pipe channels

Use when: You need to make an optional pipe to send a stream through.

If the above example looks incomplete, that’s because it’s missing context for what we’re doing with compressChannel. That’s where lazypipe comes in to play. We can save a Gulp stream to a variable using lazypipe in order to conditionally pipe our streams through later. This technique completes the above example to show how we only compress files during post-processing on production environments:

```
var lazypipe = require('lazypipe');

// https://github.com/robrich/gulp-if#works-great-inside-lazypipe
var compressChannel = lazypipe()
.pipe(function() {
  return $.if(config.js.glob, $.uglify());
})
.pipe(function() {
  return $.if(config.css.glob, $.minifyCss());
})
.pipe(function() {
  return $.if(config.html.glob, $.htmlmin(config.htmlmin));
});

return gulp.src( config.dist + '**/*' )
  .pipe( $.if( config.compressing, compressChannel() ))
  .pipe( gulp.dest(config.dist) );
});
```

## Joining streams

Use when: You need to add source files to your stream or perform different actions on similar files.

Don’t always jump to using this trick. Usually you can get away with using globbing in gulp.src, and the streams are run synchronously (it is a queue after all), so this is rarely needed. However, we used this to join two separate source streams into a single stream to simplify our fonts task. Instead of using two different tasks to grab fonts included in our bower components and project specific fonts in our source directory, we used StreamQueue to grab the sources individually in one task:

```
var streamqueue = require('streamqueue');
return streamqueue({ objectMode: true },
  gulp.src( require('main-bower-files')({ paths: config.bower }), { read: false } ),
  gulp.src( [config.fonts.src + config.fonts.glob] )
).pipe( $.if(config.fonts.glob, gulp.dest(config.fonts.dist)) );)
```

Generally, StreamQueue would be better off being used for performing different actions on similar files. This would allow you to keep all of the operations for a type of file in one task, while still accomplishing everything needed for the build process. For example, if you had different sets of CSS files to operate on using different modules, a good way to use StreamQueue for this would be:

```
return streamqueue({ objectMode: true }, 
  gulp.src( './css/src/**/*.less' ) 
  .pipe( less() ), 
  gulp.src( './css/src/second.css' ) 
  .pipe( autoprefixer('last 2 versions') )
) 
.pipe(concat('app.css')) 
.pipe(gulp.dest('./css/'));
```

## Asynchronously operating on multiple streams

Use when: You have multiple, (probably) different tasks to accomplish to complete a task.

Since one of our goals was to simplify the build process, keeping all related tasks under a single named task in our Gulpfile was helpful for achieving this. That said, it made it interesting to tackle building our CSS and JS files from different sources. For example, we use browserify for dependency management and bundling of JS files, where we don’t always want to include main bower vendor files that require shimming etc. Furthermore, we wanted to be explicit about which vendor files we were including, and the gulp-useref workflow inspired us a lot here. To build all of our CSS and JS files, we add our vendor files to an assets.json file defining what file names to write and which files to include in them:

```
{
  "css": {
    "assets/css/vendor.css": [
        "bower_components/pickadate/lib/themes/classic.css"
    ]
  },
  "js": {
    "assets/js/vendor.js": [
      "bower_components/fastclick/lib/fastclick.js",
      "bower_components/jquery/dist/jquery.js"
    ]
  }
}
```

With this, we can map the array of files to create an array of Gulp streams to be executed asynchronously, all while streaming:

```
/**
 * Creates an array of gulp streams for concatenating an array of files
 * @param {object} files - key is destination filename, val is array of files to be concatenated
 * @param {string} dist - destination path
 */
function vendorMap(files, dist) {
  var path = require('path');
  return Object.keys(files).map(function(distFile) {
    var srcFiles = files[distFile].map(function(file) {
      return config.src + file;
    });

    return gulp.src(srcFiles)
    .pipe( $.concat(path.basename(distFile)) )
    .pipe( gulp.dest(dist + path.dirname(distFile) );
  });
}
```

And finally, we concatenate these different streams using event-stream’s merge function:

```
var es  = require('event-stream');
var vendorFiles  = require('./assets.json'));

var appStream = gulp.src( [config.js.src + config.js.glob] )
...
.pipe( gulp.dest(config.js.dist) );

var vendorStream = vendorMap(vendorFiles.js, config.js.dist);

return es.merge.apply(null, vendorStream.concat(appStream));
```

## In conclusion

Our new Gulp workflow is still maturing but has been happily building projects in production environments for a couple of months now. We’ve made a few changes along the way, but they have been small and quite easy to implement. For example, we ripped out gulp-ruby-sass and replaced it with gulp-sass for native libsass speed improvements. This change was nearly effortless since our config was abstracted out and our tasks have clear separation of concerns. All it took was renaming and adjusting the SASS options in our modules configuration, and adjusting the css task. We didn’t need to touch any paths or other tasks, it just worked.

This level of flexibility is not only desired for current projects, but also helps decrease the barrier to entry for new developers on or joining our team. We don’t have the burden of describing lines of custom code to new devs, instead we have a clear system that is easy to digest and approachable by everyone after a skim of the documentation we’ve written for these few high-level architecture decisions. Future modifications are not hindered by mountains of code changes, and the conventions we follow help simplify complicated infrastructure which lets our devs save time and focus on getting tasks done.