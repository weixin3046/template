const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
// const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const CleanWebpackPlugin = require('clean-webpack-plugin'); //清除文件
var webpack = require('webpack');
// let pathsToClean = [
// 	'dist',
// ]

const config = {
	entry: { //入口
		app: [path.join(__dirname, 'src', 'index.js')]
	},
	output: { //出口
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
	},
	//路径解析配置
	resolve: {
		extensions: ['.webpack.js', '.web.js', '.js', '.jsx']
	},
	devServer: { //服务器
		compress: true, //压缩
		port: 9010, //端口
		open: true, //自动打开浏览器
		contentBase: path.join(__dirname, 'dist'), //它指定了服务器资源的根目录，如果不写入contentBase的值，那么contentBase默认是项目的目录。
		overlay: true, //这个配置属性用来在编译出错的时候，在浏览器页面上显示错误
		//hot: true, //启用 webpack 的模块热替换特性：
		inline: true //自动刷新
	},
	//插件都在plugins对象里配置
	plugins: [
		new ExtractTextPlugin("styles.css"),
		new webpack.HotModuleReplacementPlugin(),
		//new CleanWebpackPlugin(pathsToClean), //清除之前打包文件
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html', //更改生成文件的名字
			//可以把生成的 index.html 文件的内容的没用空格去掉，减少空间
			minify: {
				collapseWhitespace: true,
			},
			hash: true,
		}),
	],
	//script引入js类库，通过require或import的方式来使用，却不希望webpack把它编译到输出文件中。
	//比如不想这么用 const $ = window.jQuery 而是这么用 const $ = require("jquery") or import $ from "jquery"; 则配置"jquery": "jQuery"
	//键名是require或from时的字符串,键值是js内的全局变量名
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM',
		'baidu-hmt': 'window._hmt',
		'lrz': 'lrz',
		'iscroll': 'IScroll',
		'zepto': 'Zepto',
		'fabric': 'fabric',
		'react-slick': 'Slider'
	},
	module: {
		//在webpack3.x中还保留之前版本的loaders，与rules并存都可以使用，在新版中完全移除了loaders，必须使用rules。
		rules: [{
			test: /\.scss$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader', // 编译后用什么loader来提取css文件
				//resolve-url-loader may be chained before sass-loader if necessary
				use: ['css-loader', 'sass-loader']
			})
		}]
	}
};
// babel-polyfill用来转换ES2015新的对象和方法,在入口数组中,babel-polyfill必须在入口文件字符串前面,并且必须在入口文件代码的第一行import或require 'babel-polyfill'
for (let prop in config.entry) {
	config.entry[prop].unshift(
		'babel-polyfill'
	);
}
module.exports = config;