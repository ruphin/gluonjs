'use strict';

const gulp = require('gulp');
const jsmin = require('gulp-jsmin');
const inline = require('gulp-inline');

gulp.task('default', () => {
  return gulp.src('./src/gluon.html', {base: './src'})
    .pipe(inline({
      js: jsmin,
    }))
    .pipe(gulp.dest('.'));
});
