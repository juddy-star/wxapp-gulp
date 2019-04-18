/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const chalk = require('chalk');
const log = require('fancy-log');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const clean = require('gulp-clean');
const runsequence = require('run-sequence');
const exec = require('child_process').exec;

const run = () => {
  let start = new Date();

  const durationTime = () => {
    const duration = new Date() - start;
    return (duration / 1000).toFixed(2) + ' s';
  };

  gulp.task('clean', () => {
    return gulp.src(['mpvue/distDll', 'mpvue/dist'])
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(clean());
  })

  gulp.task('mpvueDll', ['buildMpvue'], () => {
    return gulp.src('mpvue/dist/**/*')
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(gulp.dest('mpvue/distDll'));
  });

  gulp.task('buildMpvue', (cb) => {
    exec('cd mpvue && npm run build', (err) => {
      cb(err || '');
    });
  });

  gulp.task('mpvue', (cb) => {
    start = new Date();
    runsequence('clean', ['mpvueDll'], () => {
      cb();
      log('Done ' + chalk.yellow('total ') + chalk.magenta(durationTime()));
      process.exit();
    });
  });
};

module.exports = {
  run
};