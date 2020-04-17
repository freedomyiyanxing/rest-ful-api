const Router = require('koa-router');
const {
  index,
  upload,
} = require('../controllers/home');

const router = new Router();

// 新增用户
router.get('/', index);

// 修改某个用户
router.post('/upload', upload);

module.exports = router;