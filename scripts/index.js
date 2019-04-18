const watch = require('./watch');
const build = require('./build');
const mpvue = require('./mpvue');
const {
  isProd,
  isDev,
  isMpvue
} = require('./utils');

/**
 * 自动识别
 *
 */
const autoRun = () => {
  if (isMpvue) mpvue.run();
  
  if (isDev) watch.run();
  
  if (isProd) build.run();
};

module.exports = {
  watch,
  build,
  mpvue,
  autoRun
};