const Topics = require('../modules/topics');
const Users = require('../modules/users');
const { checkExist } = require('./utils/index');

class TopicsCtl {
  // 查询所有话题数据
  async find(ctx) {
    const { page = 10, pageSize = 0, q } = ctx.query;
    // 保证不会有小数, 且又保证 page > 0;
    const pages = Math.max(page, 1) | 0;
    const sizes = (Math.max(pageSize, 0) | 0) * pages;
    // 实现分页, limit 和 skip 都接受一个 number 类型的数字,
    // limit 每一页的条数  -> page | 0 转为 number 类型
    // skip 从 number 个位置开始查询
    // 支持模糊检索 name: new RegExp(q, 'ig') -> 不区分大小写、全部;
    const data = await Topics.find({ name: new RegExp(q, 'ig') }).limit(pages).skip(sizes);
    ctx.body = {
      data,
      code: 'OK',
      message: '查询成功...',
    }
  }

  // 使用ID查询话题数据
  async findById(ctx) {
    const { fields = '' } = ctx.query;
    const { id } = ctx.params;
    let currentTopic;
    if (fields) {
      const selectFields = fields.replace(new RegExp(/\s/, 'g'), '').split(';').filter(f => f).map(m => ' +' + m).join('');
      currentTopic = await Topics.findById(id).select(selectFields);
    } else {
      currentTopic = await Topics.findById(id);
    }
    if (!currentTopic) {
      ctx.throw(412, '没有相对应的数据');
    }
    ctx.status = 200;
    ctx.body = {
      data: currentTopic,
      code: 'OK',
      message: '查询成功...',
    }
  }

  // 创建话题
  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    });
    const { body } = ctx.request;
    const { name } = body;
    const isHasName = await Topics.findOne({ name });
    if (isHasName) {
      ctx.throw(409, '已有相同的话题名称');
    }
    const topics = await new Topics(body).save();
    if (topics) {
      ctx.status = 200;
      ctx.body = {
        code: 'OK',
        message: '创建话题成功..',
        data: topics,
      }
    } else {
      ctx.throw(404, '创建失败')
    }
  }

  // 修改话题
  async upData(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    });

    const { body } = ctx.request;
    const { id } = ctx.params;
    const { name } = body;
    if (name) {
      const isHasName = await Topics.findOne({ name });
      if (isHasName) {
        ctx.throw(409, '已有相同的话题名称')
      }
    }
    const upDataTopics = await Topics.findByIdAndUpdate(id, body);
    if (!upDataTopics) {
      ctx.throw(404, '当前话题不存在')
    }
    ctx.status = 200;
    ctx.body = {
      data: upDataTopics,
      code: 'Ok',
      message: '更新成功..',
    };
  }

  // 检查话题是否存在
  async checkTopicsExist(ctx, next) {
    await checkExist(ctx, Topics);
    await next();
  };

  // 查询当前话题的关注者列表
  async listTopicFollowers(ctx) {
    const { id } = ctx.params;
    const content = await Users.find({ followingTopics: id });
    ctx.body = {
      code: 'OK',
      message: '查询当前话题的关注者列表...',
      data: content,
    };
  };
}

module.exports = new TopicsCtl();