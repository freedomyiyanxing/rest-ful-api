const path = require('path');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaBody = require('koa-body');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const routers = require('./routers/index');
const mongodbConnect = require('./mongodb');

const app = new Koa();
const isDev = process.env.NODE_ENV === 'production';

// 连接数据库;
mongodbConnect();

// 自定义错误中间件
// app.use(async (ctx, next) => {
//   try {
//     await next()
//   } catch (err) {
//     // console.log('111', err);
//     ctx.status = err.status || err.statusCode || 500;
//     ctx.body = {
//       message: err.message,
//     };
//   }
// });

// 注册静态资源目录
app.use(koaStatic(path.join(__dirname, 'public')));

// koa-json-error
app.use(error({
  // 根据环境不同返回不同的错误信息格式
  postFormat: (e, { stack, ...rest }) => isDev ? rest : { stack, ...rest, code: 'ERROR' }
}));

// 注册 bodyParser 中间件 用于获取 post 的请求体参数
app.use(koaBody({
  multipart: true,
  formidable: {
    keepExtensions: true,
    // uploadDir: path.join(__dirname, 'public/up-data-images')
  },
}));

// 校验参数的中间件
app.use(parameter(app));

// 注册路由中间件
routers(app);


app.listen(3000, () => {
  console.log('koa web api 服务 启动成功...')
});