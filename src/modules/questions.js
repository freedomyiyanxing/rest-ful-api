const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// 创建一个 用户的 Schema;
const questionSchema = new Schema({
    __v: { type: Number, select: false },
    // 问题名称
    title: { type: String, required: true },
    // 问题描述
    description: { type: String },
    // 提问者
    questioner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        select: false,
    },
});

module.exports = model('Question', questionSchema);