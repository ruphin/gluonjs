const gulp = require('gulp');
const path = require('path');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');

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

// Serve from source
gulp.task('serve', () => {
  browserSync({
    port: 5000,
    notify: false,
    open: false,
    logPrefix: 'APP',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    server: {
      baseDir: ['examples', 'src', 'node_modules']
    }
  });

  gulp.watch(['src/*.js', '/examples/*.html', 'examples/*.js'], browserSync.reload);
});
