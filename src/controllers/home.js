const path = require('path');
const fs = require('fs');

// 创建文件目录
const mkdirFile = async (name) => {
  // 如果路径存在，则返回 true，否则返回 false
  if (!fs.existsSync(name)) {
    await fs.mkdir(name, (err) => {
      if (err) throw err;
    })
  }
};

//保存文件
const saveFile = (file, filePath) => {
  let path = filePath + '/' + file.name;
  return new Promise((resolve, reject) => {
    // 创建可读流
    let render = fs.createReadStream(file.path);
    // 创建写入流
    let upStream = fs.createWriteStream(path);
    // 可读流通过管道写入可写流
    render.pipe(upStream);
    upStream.on('finish', () => {
      resolve(file);
      console.log('流 写 入 完 成');
    });
    upStream.on('error', (err) => {
      reject(err)
    });
  })
};

class HomeCtl {
  index(ctx) {
    ctx.body = '<h1 style="color: salmon">这是主页</h1>';
    ctx.status = 200;
  }

  async upload(ctx) {
    const { file } = ctx.request.files;
    const { name, size, type } = file;
    const dirName = path.join(__dirname, '../public/up-data-images');
    await mkdirFile(dirName);
    await saveFile(file, dirName);
    // const basename = path.basename(res.path);
    ctx.body = {
      url: `${ctx.origin}/up-data-images/${name}`,
      name,
      size,
      type,
    };
  }
}

module.exports = new HomeCtl();