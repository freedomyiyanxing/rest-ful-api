const fs = require('fs');

module.exports = (app) => {
  // 同步的获取 当前文件夹下的 文件 (因为这是初始化的过程 所以可以使用同步的方式去获取, 如果是用户进来触发的则不能使用同步)
  fs.readdirSync(__dirname).forEach(filename => {
    if (filename === 'index.js') {
      return false;
    }
    const router = require(`./${filename}`);
    app.use(router.routes()).use(router.allowedMethods());
  })
};