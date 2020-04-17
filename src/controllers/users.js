const jsonWebToken = require('jsonwebtoken');
const Users = require('../modules/users');
const { secret } = require('../config');
const {
  checkExist, attention, listFollow, unsubscribe,
} = require('./utils/index');

class UsersCtl {
  // 查询所有用户
  async find(ctx) {
    const { page = 10, pageSize = 0, q } = ctx.query;
    // 保证不会有小数, 且又保证 page > 0;
    const pages = Math.max(page, 1) | 0;
    const sizes = (Math.max(pageSize, 0) | 0) * pages;
    // 实现分页, limit 和 skip 都接受一个 number 类型的数字,
    // limit 每一页的条数  -> page | 0 转为 number 类型
    // skip 从 number 个位置开始查询
    // 支持模糊检索 name: new RegExp(q, 'ig') -> 不区分大小写、全部;
    const data = await Users.find({ name: new RegExp(q, 'ig') }).limit(pages).skip(sizes);
    ctx.body = {
      data,
      code: 'OK',
      message: '查询成功...',
    }
  }

  // 查询特定用户
  async findById(ctx) {
    const { fields = '' } = ctx.query;
    const { id } = ctx.params;
    let currentUser;
    if (fields) {
      // fields=locations;business 转换为 +locations+business 并且去掉所有的空字符
      const selectFields = fields.replace(new RegExp(/\s/, 'g'), '').split(';').filter(r => r).map(m => ' +' + m).join('');
      // select 查询特定数据
      currentUser = await Users.findById(id).select(selectFields)
        .populate('locations business employments.company employments.job educations.school educations.major')
    } else {
      currentUser = await Users.findById(id);
    }
    if (!currentUser) {
      ctx.throw(412, '没有相对应的数据');
    }
    ctx.status = 200;
    ctx.body = {
      data: currentUser,
      code: 'OK',
      message: '查询成功...',
    };
  }

  // 注册用户
  async create(ctx) {
    // 校验参数
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true, },
    });
    // 查询数据库校验是否重名
    const { body } = ctx.request;
    const { name } = body;
    const isSelect = await Users.findOne({ name });
    if (isSelect) {
      // 409 表示冲突
      ctx.throw(409, '用户名已存在...');
    }
    const createUser = await new Users(body).save(); //await (await Users.create(ctx.request.body)).save();
    if (createUser) {
      ctx.status = 200;
      ctx.body = {
        code: 'OK',
        message: '注册成功..',
        data: createUser,
      }
    } else {
      ctx.throw(404, '存储失败');
    }
  }

  // 验证当前身份人的信息
  async checkOwner(ctx, next) {
    if (ctx.state.user._id !== ctx.params.id) {
      ctx.throw(403, '没有权限做此操作....');
    }
    await next();
  };

  // 更新用户信息
  async upData(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false, },
      age: { type: 'number', required: false, max: 100, min: 18 },
      avatar_url: { type: 'string', required: false, },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false },
    });

    // 查询数据库校验是否重名
    const { name } = ctx.request.body;
    const isSelect = await Users.findOne({ name });
    if (isSelect) {
      // 409 表示冲突
      ctx.throw(409, '用户名已存在...');
    }

    const upDateUser = await Users.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    if (!upDateUser) {
      ctx.throw(404, '当前用户不存在, upDateUser')
    }
    ctx.status = 200;
    ctx.body = {
      data: upDateUser,
      code: 'Ok',
      message: '更新成功..',
    };
  }

  // 删除用户
  async delete(ctx) {
    const deleteUser = await Users.findByIdAndRemove(ctx.params.id);
    if (!deleteUser) {
      ctx.throw(404, '当前用户不存在... deleteUser')
    }
    ctx.status = 200;  // 204 表示操作成功 但body没有内容返回
    ctx.body = {
      code: 'OK',
      message: '删除成功...',
    }
  }

  // 用户登录
  async login(ctx) {
    // 使用 koa-parameter 校验 request.body 参数 (使用详情见文档)
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    });

    const { body } = ctx.request;
    // 查询数据库相对应的数据
    const userInfo = await Users.findOne(body);
    console.log(userInfo);
    if (!userInfo) {
      ctx.throw(400, '用户名获密码不正确')
    }
    const { _id, name } = userInfo;
    // 使用jwt返回给登录用户token (header, 内容, 密钥, 过去时间) (使用详情见文档)
    // 请求需要auth验证的接口时 需要验证token 保证是正确的
    ctx.body = {
      data: {
        token: `Bearer ${jsonWebToken.sign({ _id, name }, secret, { expiresIn: '1d' })}`,
        id: _id,
      },
      code: 'OK',
      message: '登陆成功...',
    }
  }

  // 查询当前用户已关注用户的列表
  async listFollowing(ctx) {
    await listFollow(ctx, Users, 'following');
  }

  // 查询当前用户的粉丝列表
  async listFollowers(ctx) {
    const { id } = ctx.params;
    const content = await Users.find({ following: id });
    ctx.body = {
      code: 'OK',
      message: '查询当前用户的粉丝列表...',
      data: content,
    };
  };

  // 查询当前用户已关注话题的列表
  async listFollowingTopics(ctx) {
    await listFollow(ctx, Users, 'followingTopics');
  }

  // 检查用户是否存在
  async checkUserExist(ctx, next) {
    await checkExist(ctx, Users);
    await next();
  };

  // 去关注某个用户
  async following(ctx) {
    await attention(ctx, 'following');
  }

  // 取消关注某个用户
  async unFollow(ctx) {
    await unsubscribe(ctx, 'following');
  }

  // 去关注某个话题
  async followingTopics(ctx) {
    await attention(ctx, 'followingTopics');
  }

  // 取消关注某个话题
  async unFollowTopics(ctx) {
    await unsubscribe(ctx, 'followingTopics');
  }
}

module.exports = new UsersCtl();