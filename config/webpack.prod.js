const TerserPlugin = require('terser-webpack-plugin') // js压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin') // css压缩
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { merge } = require('webpack-merge')
const common = require('./webpack.base')
const path = require('path')
const getPath = pathname => path.resolve(__dirname, pathname)

var vec = merge(common, {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: getPath('../dist'),
    // [contenthash:8] - 本应用打包输出文件级别的更新，导致输出文件名变化
    filename: 'js/[name]-[contenthash:8].js',
    // 编译前清除目录
    clean: true,
  },
  //terser-webpack-plugin 默认开启了 parallel: true 配置，并发运行的默认数量： os.cpus().length - 1 ，
  //  配置的 parallel 数量为 4，使用多进程并发运行压缩以提高构建速度。
  optimization: {
    // 通过配置 optimization.runtimeChunk = true，为运行时代码创建一个额外的 chunk，减少 entry chunk 体积，提高性能。
    // runtimeChunk: true,
    minimizer: [
      new TerserPlugin({
        parallel: 4,
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      new CssMinimizerPlugin({
        parallel: 4,
      }),
      new UglifyJsPlugin({
        uglifyOptions: {
          test: /\.js$/i,
          comments: false,
          sourceMap: true,
          warnings: false,
          parse: {},
          compress: {},
          mangle: true, // Note `mangle.properties` is `false` by default.
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_fnames: false,
        }
      }),
    ],
  },
})

var easemob = merge(common, {
  mode: 'production',
  name: "easemob",
	entry: [
		"./src/pages/plugin/index.js",
	],
	output: {
		filename: "easemob.js",
		path: path.resolve(__dirname, '../'),
		// 不能用umd模块输出的原因是：
		// 监测到AMD Loader时只执行define，此时不会初始化模块，所以不会暴露到全局
		// library: 'easemob-kefu-webim-plugin',
		// libraryTarget: 'umd',
		// umdNamedDefine: true,
	},
})

module.exports = vec

