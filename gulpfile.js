const gulp = require('gulp');
const path = require('path');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

const SOURCE = 'src';
const source = function(...subpaths) {
  return subpaths.length == 0 ? SOURCE : path.join(SOURCE, ...subpaths);
};

// Build production files, the default task
gulp.task('default', () => {
  gulp
    .src(source('gluon.js'))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['minify'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});
