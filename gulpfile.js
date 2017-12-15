const gulp = require('gulp');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const rollup = require('gulp-rollup');
const includePaths = require('rollup-plugin-includepaths');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify-es').default;

const includePathOptions = {
  include: {},
  paths: ['node_modules/gluonjs'],
  external: [],
  extensions: ['.js']
};

gulp.task('build', () => {
  return gulp
    .src(['src/gluon.js', 'node_modules/lit-html/**/*.js'])
    .pipe(rollup({ input: 'src/gluon.js', format: 'es', plugins: [includePaths(includePathOptions)] }))
    .pipe(uglify({ toplevel: true, mangle: true, compress: { passes: 2 } }))
    .pipe(gulp.dest('.'));
});

gulp.task('build-lite', () => {
  return gulp
    .src(['src/gluon.js', 'src/lib/lit-lite.js'])
    .pipe(replace('../lit-html/lib/lit-extended.js', './lib/lit-lite.js'))
    .pipe(rollup({ input: 'src/gluon.js', format: 'es' }))
    .pipe(uglify({ toplevel: true, mangle: true, compress: { passes: 2 } }))
    .pipe(rename('gluon-lite.js'))
    .pipe(gulp.dest('.'));
});

// Build production files, the default task
gulp.task('default', ['build', 'build-lite']);

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
      baseDir: ['examples', '.', 'node_modules']
    }
  });

  gulp.watch(['src/*.js', '/examples/*.html', 'examples/*.js'], browserSync.reload);
});
