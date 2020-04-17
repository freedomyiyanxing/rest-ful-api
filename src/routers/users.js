const Router = require('koa-router');
const jwt = require('koa-jwt');
const {
  find,
  findById,
  create,
  checkOwner,
  upData,
  delete: del,
  login,
  listFollowing,
  listFollowers,
  checkUserExist,
  following,
  unFollow,
  followingTopics,
  unFollowTopics,
  listFollowingTopics,
} = require('../controllers/users');
const { checkTopicsExist } = require('../controllers/topics');
const { secret } = require('../config');

const router = new Router({ prefix: '/users' });

// 这个中间做的事情如下
// 1、校验token
// 2、把token中的用户信息写到 ctx.state.user中
const auth = jwt({ secret });

// 查询所有用户
router.get('/', find);

// 查找特定用户
router.get('/:id', checkUserExist, findById);

// 新增用户
router.post('/', create);

// 修改某个用户
router.patch('/:id', auth, checkOwner, checkUserExist, upData);

// 删除用户
router.delete('/:id', auth, checkOwner, checkUserExist, del);

// 用户登录
router.post('/login', login);

// 查询当前用户已关注用户的列表
router.get('/:id/following', checkUserExist, listFollowing);

// 查询当前用户的粉丝列表
router.get('/:id/followers', checkUserExist, listFollowers);

// 查询当前用户已关注话题的列表
router.get('/:id/followingTopics', checkTopicsExist, listFollowingTopics);

// 去关注某个用户
router.put('/follow/:id', auth, checkUserExist, following);

// 取消关注某个用户
router.delete('/unFollow/:id', auth, checkUserExist, unFollow);

// 去关注某个话题
router.put('/followTopics/:id', auth, checkTopicsExist, followingTopics);

// 取消关注某个话题
router.delete('/unFollowTopics/:id', auth, checkTopicsExist, unFollowTopics);

module.exports = router;