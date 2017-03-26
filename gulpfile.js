const fs            = require('fs');
const path          = require('path');
const gulp          = require('gulp');
const include       = require('gulp-include');
const rename        = require('gulp-rename');
const clean         = require('gulp-clean');
const concat        = require('gulp-concat');
const uglifyjs      = require('uglify-js-harmony');
const minifier      = require('gulp-uglify/minifier');
const pump          = require('pump');
const runSequence   = require('run-sequence');


function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}


gulp.task('clean', function() {
  return gulp.src('dist/*', {read: false})
    .pipe(clean());
});


gulp.task('userscript', function() {
  // https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
  let folders = getFolders('src/');

  let tasks = folders.map(function(folder) {
    return pump([
      gulp.src([path.join('src/', folder, '/*.meta.js'), path.join('src/', folder, '/*.main.js')]),
      concat(folder + '.user.js'),
      include({hardFail: true}),
      gulp.dest('dist/userscript/')
    ]);
  });
});


gulp.task('compress', function(cb) {
  return pump([
    gulp.src(['dist/*.js']),
    minifier({}, uglifyjs),
    rename(function(path) {
      path.basename += '.min';
    }),
    gulp.dest('dist/minified/')
  ]);
});


gulp.task('combine', function(cb) {
  return pump([
    gulp.src('dist/*.js'),
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
      path.extname = '.js';
    }),
    gulp.dest('dist/')
  ]);
});

 
gulp.task('make', function(cb) {
  runSequence(['build', 'userscript'], 'combine', 'compress', cb)
});


gulp.task('default', ['make']);
