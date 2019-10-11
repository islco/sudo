/* jshint node: true */

"use strict";

var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");

/**
 * copy js files from node_modules into the theme
 */
gulp.task("copy:js", function() {
  return gulp
    .src([
      "node_modules/iscroll/build/iscroll.js",
      "node_modules/jquery/dist/jquery.slim.js",
      "node_modules/jquery-mousewheel/jquery.mousewheel.js",
      "node_modules/pjax/pjax.js"
    ])

    .pipe(gulp.dest("themes/sudo/source/js/vendor"));
});

/**
 * after running hexo generate, cachebust the assets for production
 */
gulp.task("build", function() {
  return (
    gulp
      .src("public/**/*", {
        nodir: true
      })

      // concat build blocks
      .pipe(
        $.if(
          ["**/*.html"],
          $.useref({
            searchPath: "public"
          })
        )
      )

      // autoprefix & minify css
      .pipe(
        $.if(
          "*.css",
          $.postcss([
            autoprefixer(),
            cssnano({
              safe: true,
              mergeRules: false
            })
          ])
        )
      )

      // uglify js
      .pipe($.if("*.js", $.uglifyEs.default()))

      // rev assets
      .pipe($.if(["**/*", "!**/*.html", "!**/*.xml"], $.rev()))

      // replace cachebusted asset references in source files
      .pipe(
        $.revReplace({
          replaceInExtensions: [".css", ".html", ".js", ".xml"]
        })
      )

      .pipe(gulp.dest("public"))
  );
});
