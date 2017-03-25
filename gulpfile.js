const gulp          = require('gulp');
const include       = require('gulp-include');
const rename        = require('gulp-rename');
const clean         = require('gulp-clean');
const concat        = require('gulp-concat');
const uglifyjs      = require('uglify-js-harmony');
const minifier      = require('gulp-uglify/minifier');
const pump          = require('pump');
const runSequence   = require('run-sequence');


gulp.task('clean', function() {
  return gulp.src('dist/*', {read: false})
    .pipe(clean());
});


gulp.task('compress', function(cb) {
  return pump([
    gulp.src(['dist/*/*.user.js', 'dist/iichan-extensions.js']),
    minifier({}, uglifyjs),
    rename(function(path) {
      path.basename += '.min';
    }),
    gulp.dest('dist/')
  ]);
});


gulp.task('combine', function(cb) {
  return pump([
    gulp.src('dist/userscript/*.js'),
    concat('iichan-extensions.js'),
    rename({dirname: ''}),
    gulp.dest('dist/')
  ]);
});


gulp.task('build', function(cb) {
  return pump([
    gulp.src('src/*/*.main.js'),
    include({hardFail: true}),
    rename(function(path) {
      let name = path.basename.split('.')[0];
      path.dirname = '';
      path.basename = 'iichan-';
      path.basename += name;
      path.basename += '.user';
      path.extname = '.js';
    }),
    gulp.dest('dist/userscript/')
  ]);
});

 
gulp.task('make', function(cb) {
  runSequence('build', 'combine', 'compress', cb)
});


gulp.task('default', ['make']);
