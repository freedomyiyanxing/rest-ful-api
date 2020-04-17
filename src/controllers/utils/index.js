// 检测是否存在
const checkExist = async (ctx, obj) => {
  const { id } = ctx.params;
  const isContent = await obj.findById(id);
  if (!isContent) {
    ctx.throw(409, '查询无此数据')
  }
};

// 关注
const attention = async (ctx, obj, name) => {
  // 解构被关注用户的ID
  const { id } = ctx.params;
  // 拿到 token 中的 登录用户的信息
  const { _id } = ctx.state.user;
  // 查询登录用户的信息并且把following也查询出来
  const me = await obj.findById(_id).select('+' + name);
  // 把 mongoose 中的 Schema.Types.ObjectId 类型 转换为 string
  // 如果登录用户 已经 关注了这个用户 则直接返回204 否则就把 被关注用户的ID存入当前用户的following字段中
  if (!me[name].map(id => id.toString()).includes(id)) {
    me[name].push(id);
    me.save(); // 保存到数据库
    ctx.status = 200;
    ctx.body = {
      code: 'OK',
      message: '关注成功...',
    }
  } else {
    ctx.status = 204;
  }
};

// 取消关注
const unsubscribe = async (ctx, obj, name) => {
  const { id } = ctx.params; // 被关注用户
  const { _id } = ctx.state.user; // 当前用户
  const me = await obj.findById(_id).select('+' + name);
  const index = me[name].map(m => m.toString()).indexOf(id);
  if (index >= 0) {
    me[name].splice(index, 1);
    me.save();
    ctx.status = 200;
    ctx.body = {
      code: 'OK',
      message: '取消关注成功...',
    }
  } else {
    ctx.status = 409;
    ctx.body = {
      code: 'ERROR',
      message: '未查询到有此关注者',
    }
  }
};

// 查询关注列表
const listFollow = async (ctx, obj, name) => {
  const { id } = ctx.params;
  const content = await obj.findById(id).select('+' + name).populate(name);
  if (!content) {
    ctx.throw(412, '查询失败...');
  }
  ctx.status = 200;
  ctx.body = {
    code: 'OK',
    message: `查询当前用户已关注 ${name} 的列表...`,
    data: content[name],
  }
};

module.exports = {
  checkExist,
  attention,
  unsubscribe,
  listFollow,
};