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
