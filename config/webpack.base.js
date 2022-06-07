const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // css抽离
const chalk = require('chalk')
const ProgressBarPlugin = require('progress-bar-webpack-plugin') // 编译进度条
const CopyPlugin = require("copy-webpack-plugin");

// package 中的 KEY_PATH 必须填，当活文档 ??
var isDev = process.env.NODE_ENV === 'development'
var SLASH_KEY_PATH = isDev ? "" : '/webim-vec';

const getPath = pathname => path.resolve(__dirname, pathname)
const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }
  try {
    require.resolve('react/jsx-runtime'); // v17 引入
    return true;
  }
  catch (e) {
    return false;
  }
})();

module.exports = {
  resolve: {
    // 配置路径别名
    alias: {
      '@': getPath("../src")
    },
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: {
          customize: require.resolve('babel-preset-react-app/webpack-overrides'),
          // preset 包含 JSX, Flow, TypeScript, ESnext
          presets: [
            [require.resolve('babel-preset-react-app'), {
              runtime: hasJsxRuntime ? 'automatic' : 'classic',
            }],
          ],
          // plugins: [
          //   [require.resolve('babel-plugin-named-asset-import'), {
          //     loaderMap: {
          //       svg: {
          //         ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
          //       },
          //     },
          //   }],
          //   isEnvDevelopment && shouldUseReactRefresh && require.resolve('react-refresh/babel'),
          // ].filter(Boolean),
          // // 这是 `babel-loader` 给 webpack 的功能，不是 babel 自己的
          // // 缓存路径 ./node_modules/.cache/babel-loader/
          // cacheDirectory: true,
          // cacheCompression: false, // #6846 告知了为什么 cacheCompression 要 disabled
          // compact: isEnvProduction,
        },
      },
      {
        test: /\.(le|c)ss$/,
        // exclude: /node_modules/,
        use: [
          'style-loader',
          // MiniCssExtractPlugin.loader,
          'css-loader',
          // 'postcss-loader',
          // 当解析antd.less，必须写成下面格式，否则会报Inline JavaScript is not enabled错误
          { loader: 'less-loader', options: { lessOptions: { javascriptEnabled: true } } },
        ],
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/,
        exclude: /node_modules/,
        type: 'asset/inline',
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]',
        },
      },
      {
        test: /\.s[ac]ss$/i,
        // exclude: /node_modules/,
        use: [
          'style-loader',
          // 将 JS 字符串生成为 style 节点
          // isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          // 将 CSS 转化成 CommonJS 模块
          'css-loader',
          // 将 Sass 编译成 CSS
          'sass-loader',
        ],
      },
      {
				test: require.resolve("underscore"),
        loader: "expose-loader",
        options: {
          exposes: {
            globalName: "_",
            override: true,
          },
        },
			},
      {
				test: require.resolve("../src/ws/webim.config.js"),
				loader: "expose-loader",
        options: {
          exposes: ['WebIM']
        }
			},
      {
				test: [
					/plugin(\\|\/)+index\.js$/
				],
        exclude: /node_modules/,
				loader: "string-replace-loader",
        options: {
          search: "__WEBIM_SLASH_KEY_PATH__",
					replace: SLASH_KEY_PATH,
        }
			},
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      title: '环信客服',
      filename: 'index.html',
      template: getPath('../public/index.html'),
      excludeChunks: ['easemobvec']
    }),
    new CleanWebpackPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: './css/[name].css',
    // }),
    // 进度条
    new ProgressBarPlugin({
      format: `  :msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`,
    }),
    // 复制文件
    new CopyPlugin({
      patterns: [
        { from: getPath('../src/libs'), to: getPath('../build/js') },
        { from: getPath('../public/demo.html'), to: getPath('../build')}
      ],
    }),
  ],
}

