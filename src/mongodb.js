const mongoose = require('mongoose');
const { mongodbUrl } = require('./config');
module.exports = () => {
  mongoose.connect(mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }).then(() => {
    console.log('mongodb connect success -> 数据库连接成功');
  });

  // 数据库连接失败时触发
  mongoose.connection.on('error', console.error.bind(console, 'connection error ->'));
};

