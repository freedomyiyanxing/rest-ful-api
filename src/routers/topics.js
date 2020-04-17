const Router = require('koa-router');
const jwt = require('koa-jwt');
const {
  find, findById, create, upData, listTopicFollowers, checkTopicsExist,
} = require('../controllers/topics');

const { secret } = require('../config');

const router = new Router({ prefix: '/topics' });

const auth = jwt({ secret });

router.get('/', find);

router.get('/:id', checkTopicsExist, findById);

router.post('/', auth, create);

router.patch('/:id', auth, checkTopicsExist, upData);

router.get('/:id/followers', checkTopicsExist, listTopicFollowers);

module.exports = router;