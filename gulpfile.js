/* jshint node: true */

'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

gulp.task('rev', function() {

  // return gulp.src('public/**/*')
  return gulp.src('public/**/*', {
      nodir: true
    })

    // autoprefix & minify css
    .pipe($.if('*.css',
      $.postcss([
        autoprefixer({ browsers: ['> 1%']}),
        cssnano()
      ])))

    // uglify js
    .pipe($.if('*.js',
      $.uglify()))

    // minify html
    .pipe($.if(['**/*.html'],
      $.htmlMinifier({
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        removeOptionalTags: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
      })))

    // rev assets
    .pipe($.if(['**/*', '!**/*.html', '!**/*.xml'],
      $.rev()))

    // replace cachebusted asset references in source files
    .pipe($.revReplace({
      replaceInExtensions: ['.css', '.html', '.js', '.xml']
    }))

    .pipe(gulp.dest('public'));
});

gulp.task('default', ['rev']);
