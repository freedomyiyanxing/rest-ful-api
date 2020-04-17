const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// 创建一个 用户的 Schema;
const topicsSchema = new Schema({
  __v: { type: Number, select: false },
  // 话题名称
  name: { type: String, required: true },
  // 话题图像
  avatar_url: { type: String },
  // 话题简介
  introduction: { type: String, select: false },
});

module.exports = model('Topics', topicsSchema);