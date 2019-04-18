/* eslint-disable import/no-extraneous-dependencies */
const yargs = require('yargs');
const cached = require('gulp-cached');
const { blackList } = require('./legalList');
const log = require('fancy-log');
const chalk = require('chalk');
// const remember = require('gulp-remember');

/**
 * 
 * 生成src， 主要是为了带上黑名单
 *
 * @param {*} [src=[]]
 * @returns
 */
const generateSrc = (src = []) => {
  // string转array
  if (typeof src === 'string') src = [src];

  if (!Array.isArray(src)) throw new Error('param type is not string or array');

  const generateBlackList = blackList.map(black => `!src/${black}/**/*`);

  return [...src, ...generateBlackList];
};

/**
 * 解析CMD命令
 *
 * @returns
 */
const analysisCmd = () => {
  const { argv: { _: name = 'default', mpvue: witchMpvue = false } = {} } = yargs;
  return {
    name: name[0] || 'default',
    witchMpvue
  };
};

/**
 * 动态判断当前环境
 *
 * @param {*} [envTypes=[]]
 * @returns
 */
const isEnvType = (envTypes = []) => {
  const { name = '' } = analysisCmd();
  return envTypes.some(item => item === name);
};

/**
 * 改变文件后缀
 *
 * @param {*} path
 * @param {*} extname
 */
const reExtname = (path, extname) => {
  try {
    path.extname = extname;
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * 删除watch过程中的缓存
 *
 * @param {*} type
 * @param {*} path
 */
const deleteCached = (type, path) => {
  try {
    if (type === 'deleted') {                   // 如果一个文件被删除了，则将其忘记
      delete cached.caches.originJs[path];       // gulp-cached 的删除 api
      delete cached.caches.originLess[path];       // gulp-cached 的删除 api
      // remember.forget('originJs', path);         // gulp-remember 的删除 api
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * gulp的日志功能
 *
 * @param {string} [event='add']
 * @param {*} [path=__dirname]
 */
const gulpLog = (event = 'add', path = __dirname) => {
  try {
    if (['change', 'changed'].some(item => item === event.toLowerCase())) {
      const relativePath = path.replace(__dirname, '').slice(1);
      log(event[0].toUpperCase() + event.slice(1), '\'' + chalk.cyan(relativePath) + '\'');
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  generateSrc,
  isProd: isEnvType(['default', 'build']),
  isDev: isEnvType(['watch']),
  isMpvue: isEnvType(['mpvue']),
  witchMpvue: analysisCmd().witchMpvue,
  reExtname,
  deleteCached,
  gulpLog
};