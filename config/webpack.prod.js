const TerserPlugin = require('terser-webpack-plugin') // js压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin') // css压缩
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 打包分析
const { merge } = require('webpack-merge')
const common = require('./webpack.base')
const path = require('path')
const webpack = require('webpack');
const getPath = pathname => path.resolve(__dirname, pathname)
const TRAVIS_TAG = process.env.TRAVIS_TAG;

var filterName = ['easemobvec']

var vec = merge(common, {
  mode: 'production',
  entry: {
    main: './src/index.js',
    easemobvec: './src/pages/plugin/index.js'
  },
  output: {
    path: getPath('../build'),
    // [contenthash:8] - 本应用打包输出文件级别的更新，导致输出文件名变化
    filename: info => filterName.includes(info.chunk.name) ? '[name].js' : `js/[name]-[contenthash:8]-${TRAVIS_TAG}.js`,
    // 编译前清除目录
    clean: true,
  },
  //terser-webpack-plugin 默认开启了 parallel: true 配置，并发运行的默认数量： os.cpus().length - 1 ，
  //  配置的 parallel 数量为 4，使用多进程并发运行压缩以提高构建速度。
  optimization: {
    // 通过配置 optimization.runtimeChunk = true，为运行时代码创建一个额外的 chunk，减少 entry chunk 体积，提高性能。
    // runtimeChunk: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // 禁止 license
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
    ],
    // node_modules 单独打包
  //   splitChunks: {
  //     cacheGroups:{
  //         vendors:{//node_modules里的代码
  //             test: /[\\/]node_modules[\\/]/,
  //             chunks: "initial",
  //             name:'vendors', //chunks name
  //             priority: 10, //优先级
  //             enforce: true
  //         }
  //     }
  // },
  },
  plugins: [
    // 打包体积分析
    // new BundleAnalyzerPlugin(),
    // Moment.js 是非常流行的，其 bundle 有极其巨大的本地文件
    // 本项是一个非常实际的配置，可以定义你实际需要的语言种类，如果你不用 moment，那本项可以注释掉
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/
    }),
  ],
})

module.exports = vec

