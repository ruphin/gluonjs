'use strict';

const gulp = require('gulp');
const jsmin = require('gulp-jsmin');
const browserSync = require('browser-sync');

gulp.task('default', () => {
  return gulp.src('./src/gluon.js', { base: './src' }).pipe(jsmin()).pipe(gulp.dest('.'));
});

// Serve from source
gulp.task('serve', function() {
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
      baseDir: ['']
    }
  });

  gulp.watch(['**/*.html', '**/*.js', 'index.html'], browserSync.reload);
});
