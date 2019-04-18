/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const chalk = require('chalk');
const uglify = require('gulp-uglify');
// const htmlmin = require('gulp-htmlmin');
const less = require('gulp-less');
// const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const jsonminify = require('gulp-jsonminify');
// const autoprefixer = require('gulp-autoprefixer');
// const filter = require('gulp-filter');
const shell = require('gulp-shell');
const log = require('fancy-log');
// const remember = require('gulp-remember');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const runsequence = require('run-sequence');
const exec = require('child_process').exec;

const {
  generateSrc,
  reExtname,
  witchMpvue
} = require('./utils.js');

const run = () => {
  let start = new Date();

  const durationTime = () => {
    const duration = new Date() - start;
    return (duration / 1000).toFixed(2) + ' s';
  };

  gulp.task('clean', () => {
    return gulp.src(['dist', 'mpvue/dist'])
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(clean());
  })


  gulp.task('wxmlResource', () => {
    return gulp.src(generateSrc('src/**/*.wxml'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      // .pipe(gulpif(isProd, rename((path) => { reExtname(path, '.html'); })))
      // .pipe(gulpif(isProd, htmlmin({ collapseWhitespace: true, removeComments: true })))
      // .pipe(gulpif(isProd, rename((path) => { reExtname(path, '.wxml'); })))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('jsonResource', () => {
    return gulp.src(generateSrc('src/**/*.json'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(jsonminify())
      .pipe(gulp.dest('dist'));
  });

  gulp.task('wxssResource', () => {
    return gulp.src(generateSrc('src/**/*.wxss'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('lessResource', () => {
    return gulp.src(generateSrc('src/**/*.less'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      // .pipe(rename((path) => { reExtname(path, '.less'); }))
      .pipe(less())
      // .pipe(rename((path) => { reExtname(path, '.css'); }))
      // .pipe(autoprefixer())
      // .pipe(cssmin())
      .pipe(rename((path) => {
        reExtname(path, '.wxss');
      }))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('otherResource', () => {
    return gulp.src(generateSrc('src/**/*.!(json|wxss|wxml|js|less)'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('cpMpvueResource', ['buildMpvue'], () => {
    // 如果不处理mpvue，则直接加载mpvue的distDll（无需编译）
    const mpvueResource = witchMpvue ? ['mpvue/dist/**/*', '!mpvue/dist/*'] : ['mpvue/distDll/**/*', '!mpvue/distDll/*'];

    return gulp.src(generateSrc(mpvueResource))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('buildSrc', () => {
    return gulp.src(generateSrc('src/**/*.js'))
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(babel())
      .pipe(uglify())
      .pipe(gulp.dest('dist'));
  });

  gulp.task('buildMpvue', (cb) => {
    if (witchMpvue) {
      exec('cd mpvue && npm run build', (err) => {
        cb(err || '');
      });
    } else {
      cb();
    }
  });

  gulp.task('packagesOpt', shell.task('npm run perf'));

  gulp.task('cpSrcResource', ['wxmlResource', 'jsonResource', 'wxssResource', 'lessResource', 'otherResource']);

  gulp.task('cpResource', ['cpSrcResource']);

  gulp.task('building', ['buildSrc', 'buildMpvue']);

  gulp.task('start', ['cpResource', 'building']);

  gulp.task('build', (cb) => {
    start = new Date();
    runsequence('clean', ['start', 'cpMpvueResource'], ['packagesOpt'], () => {
      cb();
      log('Done ' + chalk.yellow('total ') + chalk.magenta(durationTime()));
      process.exit();
    });
  });

  gulp.task('default', ['build']);
};

module.exports = {
  run
};