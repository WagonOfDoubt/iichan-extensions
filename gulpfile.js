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
const jsEscape      = require('gulp-js-escape');
const wrap          = require('gulp-wrap');
const babel         = require('gulp-babel');


const getFolders = dir => fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());


gulp.task('clean', () => gulp.src('dist/*', {read: false})
  .pipe(clean())
);


gulp.task('userscript', ['build'], () => {
  // https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
  const folders = getFolders('src/');

  const tasks = folders.map(folder => pump([
      gulp.src([path.join('src/', folder, '/*.meta.js'), path.join('src/', folder, '/*.main.js')]),
      concat('iichan-' + folder + '.user.js'),
      include({hardFail: true}),
      gulp.dest('dist/userscript/'),
      gulp.src(path.join('src/', folder, '/*.meta.js')),
      rename('iichan-' + folder + '.meta.js'),
      gulp.dest('dist/userscript/')
    ])
  );
});


gulp.task('compress', ['build'], cb => pump([
    gulp.src(['dist/*.js']),
    minifier({}, uglifyjs),
    rename(path => {
      path.basename += '.min';
    }),
    gulp.dest('dist/minified/')
  ])
);


gulp.task('es5', ['build'], cb => pump([
    gulp.src(['dist/*.js']),
    babel({
      presets: ['es2015-nostrict']
    }),
    rename(path => {
      path.basename += '.es5';
    }),
    gulp.dest('dist/es5/')
  ])
);


gulp.task('es5:compress', ['es5'], cb => pump([
  gulp.src(['dist/es5/*.js']),
  minifier({}, uglifyjs),
  rename(path => path.basename += '.min'),
  gulp.dest('dist/es5/minified/')
]));


gulp.task('es5:escape', ['es5:compress'], cb => pump([
    gulp.src(['dist/es5/minified/*.js']),
    jsEscape(),
    wrap({ src: 'src/eval-wrapper.js'}),
    rename(path => {
      path.basename += '.escaped';
    }),
    gulp.dest('dist/es5/escaped/')
  ])
);


gulp.task('combine', ['build'], cb => pump([
    gulp.src(['dist/*.js', '!dist/iichan-extensions.js']),
    concat('iichan-extensions.js'),
    rename({dirname: ''}),
    gulp.dest('dist/')
  ])
);


gulp.task('build', cb => pump([
    gulp.src('src/*/*.main.js'),
    include({hardFail: true}),
    rename(path => {
      const name = path.basename.split('.')[0];
      path.dirname = '';
      path.basename = 'iichan-';
      path.basename += name;
      path.extname = '.js';
    }),
    gulp.dest('dist/')
  ])
);


gulp.task('escape', ['compress'], cb => pump([
    gulp.src(['dist/minified/*.js']),
    jsEscape(),
    wrap({ src: 'src/eval-wrapper.js'}),
    rename(path => {
      path.basename += '.escaped';
    }),
    gulp.dest('dist/escaped/')
  ])
);


gulp.task('make', ['build', 'es5', 'compress', 'es5:compress', 'escape', 'es5:escape', 'userscript']);


gulp.task('default', ['make']);
