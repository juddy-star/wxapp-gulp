/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const chalk = require('chalk');
// const htmlmin = require('gulp-htmlmin');
const less = require('gulp-less');
// const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
// const autoprefixer = require('gulp-autoprefixer');
const log = require('fancy-log');
const cached = require('gulp-cached');
// const remember = require('gulp-remember');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const clean = require('gulp-clean');
const watch = require('gulp-watch');
const babel = require('gulp-babel');
const gulpif = require('gulp-if');
const runsequence = require('run-sequence');
const exec = require('child_process').exec;

const {
  generateSrc,
  reExtname,
  gulpLog,
  deleteCached,
  witchMpvue
} = require('./utils.js');

const run = () => {
  const durationTime = () => {
    const duration = new Date() - start;
    return (duration / 1000).toFixed(2) + ' s';
  };

  let start = new Date();
  let watchDone = false;

  gulp.task('clean', () => {
    return gulp.src(['dist', 'mpvue/dist'])
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(clean());
  })

  gulp.task('buildMpvue', (cb) => {
    // 如果监听mpvue，则需要开启mpvue的watch功能
    if (witchMpvue) exec('cd mpvue && npm start');
    cb();
  });

  gulp.task('cpMpvueResource', ['buildMpvue'], () => {
    // 如果不监听mpvue，则直接加载mpvue的distDll（无需编译）
    const mpvueResource = witchMpvue ? ['mpvue/dist/**/*', '!mpvue/dist/*'] : ['mpvue/distDll/**/*', '!mpvue/distDll/*'];

    return gulp.src(generateSrc(mpvueResource))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(gulpif(witchMpvue, watch(['mpvue/dist/**/*', '!mpvue/dist/*'], {}, (data) => {
        if (watchDone) {
          const {
            event,
            path
          } = data;
          gulpLog(event, path);
        }
      })))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('watchJs', () => {
    return gulp.src(generateSrc('src/**/*.js'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(cached('originJs'))
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('dist'));
  });

  gulp.task('watchWxss', () => {
    return gulp.src(generateSrc('src/**/*.wxss'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(cached())
      .pipe(gulp.dest('dist'));
  }); 

  gulp.task('watchLess', ['watchWxss'], () => {
    return gulp.src(generateSrc('src/**/*.less'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(sourcemaps.write())
      .pipe(rename((path) => { reExtname(path, '.wxss'); }))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('watchOthers', () => {
    return gulp.src(generateSrc('src/**/*.!(js|less|wxss)'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(cached())
      .pipe(gulp.dest('dist'));
  });

  gulp.task('watchResource', ['watchJs', 'watchLess', 'watchOthers']);

  gulp.task('watching', () => {
    const watcher = gulp.watch(['src/**/*'], ['watchResource'], {
      interval: 3000
    });
    watcher.on('change', (event) => {
      const {
        type,
        path
      } = event;

      deleteCached(type, path, cached);
      gulpLog(type, path);
    });
  });

  gulp.task('watch', (cb) => {
    start = new Date();
    runsequence('clean', ['cpMpvueResource', 'watching']);
    runsequence('clean', 'watchResource', () => {
      cb();
      log('Watching ' + chalk.yellow('total ') + chalk.magenta(durationTime()));
      watchDone = true;
    });
  });
};

module.exports = {
  run
};