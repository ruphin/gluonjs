'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const jsmin = require('gulp-jsmin');
const rename = require('gulp-rename');

gulp.task('default', () => {
  return gulp.src('./src/gluon.js', {base: './src'})
    .pipe(sourcemaps.init())
    .pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});
