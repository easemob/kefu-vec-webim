const { merge } = require('webpack-merge')
const path = require('path')
const common = require('./webpack.base')

var vec = merge(common, {
  mode: 'development',
  // 开发工具，开启 source map，编译调试
  devtool: 'eval-cheap-module-source-map',
  cache: {
    type: 'filesystem', // 使用文件缓存
  },
  entry: './src/index.js',
  devServer: {
    historyApiFallback: true,
    open: true, // 自动打开页面
    // 默认为true
    hot: true,
    // 是否开启代码压缩
    compress: true,
    // 启动的端口
    port: 8888,
    // 代理
    proxy: {
      "/push": {
        target: "ws://" + 'sandbox.kefu.easemob.com',
        ws: true
      },
      '/v1/*': { // 如果接口不是v1开始就死了。。
        // changeOrigin: true,
        // target: (process.env.HTTPS ? "https://" : "http://") + process.env.PROXY_TO,
        target: "http://" + 'sandbox.kefu.easemob.com',
        // 没有黑名单配置方式
        // 静态资源最优先
        // 只需要区分 路由 和 接口
        // bypass: (req, res, proxyOptions) => {
        //   let targetRule = rewriteConfig.find(rule => rule === req.url);
        //   if (targetRule) {
        //     return req.url;
        //   }
        //   else {
        //     console.log("PROX", req.url);
        //   }
        // },
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
})

// var easemob = {
//   mode: 'development',
//   name: "easemob",
//   devtool: 'eval-cheap-module-source-map',
// 	entry: [
// 		"./src/pages/plugin/index.js",
// 	],
// 	output: {
// 		filename: "easemob.js",
// 		path: path.resolve(__dirname, '../'),
// 		// 不能用umd模块输出的原因是：
// 		// 监测到AMD Loader时只执行define，此时不会初始化模块，所以不会暴露到全局
// 		// library: 'easemob-kefu-webim-plugin',
// 		// libraryTarget: 'umd',
// 		// umdNamedDefine: true,
// 	},
// }

module.exports = vec
