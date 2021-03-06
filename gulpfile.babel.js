import babel from 'gulp-babel';
import composer from 'gulp-uglify/composer';
import concat from 'gulp-concat';
import del from 'del';
import fs from 'fs';
import gulp from 'gulp';
import include from 'gulp-include';
import jsEscape from 'gulp-js-escape';
import merge from 'merge-stream';
import order from 'gulp-order';
import path from 'path';
import rename from 'gulp-rename';
import uglifyjs from 'uglify-es';
import wrap from 'gulp-wrap';
import data from 'gulp-data';
import template from 'gulp-template';
import _ from 'lodash';


const minifier = composer(uglifyjs, console);
_.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

const getFolders = dir => fs
  .readdirSync(dir)
  .filter(file =>
    fs.statSync(path.join(dir, file))
      .isDirectory());


const buildUserscript = (folder) => {
  const mainPath = path.join('src', folder, `${folder}.main.js`);
  const metaPath = path.join('src', folder, `${folder}.meta.js`);
  const dataPath = path.join('src', folder, 'data.json');
  const getData = () => {
    if (fs.existsSync(dataPath)) {
      const json = JSON.parse(fs.readFileSync(dataPath));
      json.USERSCRIPT = true;
      json.ICONS_URL = '';
      return json;
    }
    return null;
  }
  const userscriptFileName = 'iichan-' + folder + '.user.js';
  const dest = path.join('dist', 'userscript');

  return gulp.src(mainPath)
    .pipe(include({ hardFail: true }))
    .pipe(wrap({ src: 'src/closure-wrapper.js'}))
    .pipe(gulp.src(metaPath))
    .pipe(data(getData))
    .pipe(template())
    .pipe(order(['*.meta.js', '*.main.js']))
    .pipe(concat(userscriptFileName))
    .pipe(gulp.dest(dest));
};


/**
 * Create userscripts
 */
export const userscript = () => {
  const folders = getFolders('src/');
  const tasks = folders.map((folder) => buildUserscript(folder));

  const copyMeta = gulp.src('src/*/*.meta.js')
    .pipe(rename({ prefix: 'iichan-', dirname: '' }))
    .pipe(gulp.dest('dist/userscript/'));

  return merge(tasks, copyMeta);
};


/**
 * Delete contents of dist folder
 */
export const clean = () => del('dist/**');


/**
 * Build js files from sources
 */
export const build = () => {
  const renameFn = filePath => {
    filePath.dirname = '';
    filePath.basename = 'iichan-' + filePath.basename.split('.')[0];
    filePath.extname = '.js';
  };
  const getData = (file) => {
    const dataPath = path.join(file.dirname, 'data.json');
    if (fs.existsSync(dataPath)) {
      const json = JSON.parse(fs.readFileSync(dataPath));
      json.USERSCRIPT = false;
      return json;
    }
    return null;
  };
  return gulp.src('src/*/*.main.js')
    .pipe(include({ hardFail: true }))
    .pipe(wrap({ src: 'src/closure-wrapper.js'}))
    .pipe(data(getData))
    .pipe(template())
    .pipe(rename(renameFn))
    .pipe(gulp.dest('dist/'))
    // minify
    .pipe(minifier({}, uglifyjs))
    .pipe(rename(path => path.basename += '.min'))
    .pipe(gulp.dest('dist/minified/'))
    // eval wrapper
    .pipe(jsEscape())
    .pipe(wrap({ src: 'src/eval-wrapper.js'}))
    .pipe(rename(path => path.basename += '.escaped'))
    .pipe(gulp.dest('dist/escaped/'));
};


/**
 * Babelify js files in *dist* folder.
 * Depends on: *build*
 */
export const es5 = () => {
  const renameFn = filePath => {
    filePath.dirname = '';
    filePath.basename = 'iichan-' + filePath.basename.split('.')[0];
    filePath.extname = '.js';
  };
  return gulp.src('dist/*.js')
    .pipe(babel({
      presets: [
        [
          '@babel/preset-env',
          {
            targets: 'since 2015',
          }
        ]
      ],
    }))
    .pipe(rename({
      suffix: '.es5',
    }))
    .pipe(gulp.dest('dist/es5/'))
    // minify
    .pipe(minifier({}, uglifyjs))
    .pipe(rename(path => path.basename += '.min'))
    .pipe(gulp.dest('dist/es5/minified/'))
    // eval wrapper
    .pipe(jsEscape())
    .pipe(wrap({ src: 'src/eval-wrapper.js'}))
    .pipe(rename(path => path.basename += '.escaped'))
    .pipe(gulp.dest('dist/es5/escaped/'));
};


const buildall = gulp.series(
  clean,
  gulp.parallel(
    gulp.series(build, es5),
    userscript
  )
);


export default buildall;
