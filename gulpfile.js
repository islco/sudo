/* jshint node: true */

'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

/**
 * copy js files from node_modules into the theme
 */
gulp.task('copy:js', function() {
  return gulp.src([
    'node_modules/jquery/dist/jquery.slim.js',
    'node_modules/jquery-mousewheel/jquery.mousewheel.js',
    'node_modules/iscroll/build/iscroll.js',
  ])

  .pipe(gulp.dest('themes/isl/source/js/vendor'));
});

/**
 * after running hexo generate, cachebust the assets for production
 */
gulp.task('build', function() {
  return gulp.src('public/**/*', {
    nodir: true
  })

  // concat build blocks
  .pipe($.if(['**/*.html'], $.useref({
    searchPath: 'public'
  })))

  // minify html
  .pipe($.if(['**/*.html'], $.htmlMinifier({
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    removeOptionalTags: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
  })))

  // autoprefix & minify css
  .pipe($.if('*.css', $.postcss([
    autoprefixer({ browsers: ['> 1%']}),
    cssnano()
  ])))

  // uglify js
  .pipe($.if('*.js', $.uglify({
    preserveComments: 'license'
  })))

  // rev assets
  .pipe($.if(['**/*', '!**/*.html', '!**/*.xml'], $.rev()))

  // replace cachebusted asset references in source files
  .pipe($.revReplace({
    replaceInExtensions: ['.css', '.html', '.js', '.xml']
  }))

  .pipe(gulp.dest('public'));
});
