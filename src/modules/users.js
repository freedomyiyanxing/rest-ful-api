const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// 创建一个 用户的 Schema;
const userSchema = new Schema({
  __v: { type: Number, select: false },
  // 姓名
  name: { type: String, required: true },
  // 年龄
  age: { type: Number, required: false },
  // 密码 select 是否可以查询该字段
  password: {
    type: String,
    required: true,
    // select: true,  // 默认是true 设置为false 则不能查询该字段
    validate: {
      validator: function (v) { // 自定义验证器
        return /[0-9a-zA-Z]{6,8}/.test(v);
      },
      message: '{VALUE} 必须是一个长度为6-8位的数字或者字符串',
    },
  },
  // 用户图像
  avatar_url: { type: String },
  // 性别 可以枚举的 只有 'male', 'female', 默认是 male
  gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
  // 个人描述
  headline: { type: String },
  // 居住地
  locations: { type: [{ type: Schema.Types.ObjectId, ref: 'Topics' }], select: false },
  // 行业
  business: { type: Schema.Types.ObjectId, ref: 'Topics', select: false, },
  // 职业简历 [{ company: 'xxx', job: 'xxx' }]
  employments: {
    select: false,
    type: [
      {
        company: { type: Schema.Types.ObjectId, ref: 'Topics' }, // 公司
        job: { type: Schema.Types.ObjectId, ref: 'Topics' }, // 职位
      }
    ]
  },
  // 教育经历
  educations: {
    select: false,
    type: [
      {
        school: { type: Schema.Types.ObjectId, ref: 'Topics' }, // 学校
        major: { type: Schema.Types.ObjectId, ref: 'Topics' }, // 专业
        diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
        entrance_year: { type: String },
        graduation_year: { type: String },
      }
    ]
  },
  // 已关注用户的信息
  following: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Users', // 通过设置ref='Users' 能查询到Users这个Schema中相对应的用户信息
      },
    ],
    select: false,
  },
  // 关注话题
  followingTopics: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Topics', // 通过设置ref='Users' 能查询到Users这个Schema中相对应的用户信息
      },
    ],
    select: false,
  }
});

module.exports = model('Users', userSchema);