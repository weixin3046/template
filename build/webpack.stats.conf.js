/*
 * 请使用最新版本nodejs
 * 默认配置,是按生产环境的要求设置,也就是使用 webpack -p 命令就可以生成正式上线版本。
 * 也可以使用 webpack -d -w 命令,生成用于开发调试的代码。
 * 通常开发使用 node server.dev.js 命令 , server.dev.js基于此配置做了特殊处理, 主要是为了自动刷新和热更新, 这个服务只是在内存中生成缓存文件,不会在硬盘中生成文件。
 * webpack配置,如果出现问题,通常都是路径问题造成的
 *
 * 常用命令看package.json中配置的scripts,比如
 * "scripts": {
 * "d": "node server.dev.js",
 * "reset:dist": "rm -fr dist && mkdir -p dist/build && cp -r src/lib dist",
 * "p": "npm run reset:dist && ./node_modules/.bin/webpack -p --display-error-details --progress --colors"
 * }
 */


//导入Node.js的path模块,主要用来转换成绝对路径,比如path.resolve(__dirname, 'build')
const path = require('path');

//导入webpack整个模块
//也可以不导入webpack整个模块,而值导入用到的内置插件模块
//比如 var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
//这样后面使用方式为 new CommonsChunkPlugin
//否则为new webpack.optimize.CommonsChunkPlugin
const webpack = require('webpack');

//导入ExtractTextPlugin插件,作用提取代码中的css生成独立的CSS文件
const ExtractTextPlugin = require('extract-text-webpack-plugin');

//导入HtmlWebpackPlugin插件,作用按需求生成html页面,想用好,挺麻烦的,可以不用
const HtmlWebpackPlugin = require('html-webpack-plugin');

//打包配置 webpack配置,多数同时支持String, Array or Object的写法。单字符串的形式用于简单情况,key-value对象的形式用于复杂情况。
const config = {

	// 入口文件配置,打包输出的来源
	// 多种写法 entry:'entry.js' or entry:{entry1:'entry1.js'} or entry:{entry1:['entry1a.js', ...]} or etc.
	// 通常用path.resolve(__dirname, 'src/entry.js')转换成绝对路径,也可以使用相对路径,比如 './src/entry.js'
	entry: {
		index: [path.resolve(__dirname, 'src/index.js')],
		edit: [path.resolve(__dirname, 'src/edit.js')]
	},

	//输出配置
	//path 输出目录 通常用path.resolve(__dirname, 'build')转换成绝对路径,也可以使用相对路径,比如 './build'
	//publicPath 开发代码中url的转换拼接处理,通常是代码中各种资源的地址,比如图片等, url目录前缀或完整网址url前缀'http://cdn.com/'
	//filename 输出js文件名,[name]对应entry对象键名,也可以指定名字,加上id和hash可以避免缓存问题,webpack会用实际值替换类似[hash]这样字符串
	output: {
		path: path.resolve(__dirname, 'dist/build'),
		publicPath: './build/',
		filename: '[name].[id].[hash].js',

	},

	//路径解析配置
	resolve: {
		//自行补全路径中文件的后缀, 第一个是空字符串，对应不需要后缀的情况
		extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
	},

	//模块
	module: {
		//loaders: 加载器
		// [
		//     {
		//         test:正则表达式,匹配的文件名则使用这个加载器。
		//         include: 匹配的目录则进一步处理
		//         exclude: 匹配的目录则排除
		//         loader: `!`用于分隔loader 字符串形式,作用和数组形式一样
		//         loaders: ['loader',...] 数组形式,作用和字符串形式一样
		//     }
		// ]
		//
		// 如果同一文件需要多个loaders处理,也就是使用loaders: ['loader',...] 数组形式,loader的参数不能使用query:{}写法了。只能用拼接字符串写法。
		loaders: [{
				//加载css资源,默认写法loader:'style-loader!css-loader' css为Internal内部形式
				//ExtractTextPlugin插件写法用于生成独立的css文件,用于external link形式
				//生成的独立CSS文件中的url图片地址的publicPath,通常JS中的publicPath不一样,如果一样可以不设置
				test: /\.css$/,
				loader: ExtractTextPlugin.extract(
					'style-loader',
					'css-loader', {
						publicPath: "./"
					}
				)
			}, {
				//url-loader处理图片URL,如果图片小于limit值直接生成`base64` 格式的`dataUrl`,否则输出图片,name参数指定输出目录和图片名
				//url-loader依赖file-loader
				//image-webpack-loader是用来压缩图片的,主要是透明PNG
				test: /\.(jpe?g|png|gif|svg)$/i,
				loaders: [
					'url-loader?limit=8192&name=img/[name].[hash].[ext]',
					'image-webpack-loader?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
				]
			}, {
				//用babel转码器加载有es2015和jsx语法的js,输出为es5语法的js,注意这里只是语法转码。
				//如果开发代码中有用到新ES规范中的新对象或属性方法还需要babel-polyfill才能转码成ES5代码
				//class-properties和object-rest-spread,是转码类属性写法和非数组对象的延展符...,新React常用到的写法,但还不是ES2015规范
				//query对象和.babelrc配置文件内容一致,必须都写,不然使用webpack的babel-loader会报错.
				test: /\.jsx?$/,
				exclude: /(node_modules|lib)/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'react'],
					plugins: ['transform-class-properties', 'transform-object-rest-spread']
				}
			}

		]
	},

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

	plugins: [
		//输出独立的css文件,用于external link形式,如果有多个入口JS共用的CSS,会生成commons.css
		new ExtractTextPlugin('[name].[id].[hash].css'),

		//把entry中配置的多个js中共用代码提取生成为单个js, 多参数写法 new webpack.optimize.CommonsChunkPlugin("commons", "commons.js")
		new webpack.optimize.CommonsChunkPlugin({
			name: "commons",
			filename: "commons.[id].[hash].js"
		}),

		//按需求生成HTML页面
		//template 模板位置
		//inject: 'body' js插入在body元素内部的最后
		//chunks 对应入口文件名
		//filename 生成的文件名,可以带上路径
		//options参数对象的值可以自定义,比如这里的libJS
		//在模板页中可以获得和使用这些数据,可以在模板页中使用<%= JSON.stringify(htmlWebpackPlugin) %>;输出查看所有可用的数据
		new HtmlWebpackPlugin({
			template: 'src/template.html',
			inject: 'body',
			chunks: ['commons', 'index'],
			filename: '../index.html',
			title: '最美奥运脸',
			libJS: [
				//上拉下拉
				'./lib/js/iscroll-lite.min.js'
			]
		}),
		new HtmlWebpackPlugin({
			template: 'src/template.html',
			inject: 'body',
			chunks: ['commons', 'edit'],
			filename: '../edit.html',
			title: '最美奥运脸',
			libJS: [
				//切换左右拖动
				'./lib/js/react-slick.min.js',
				//编辑图片
				'./lib/js/fabric.min.js'
			]
		})

		//ProvidePlugin的作用就是在开发代码内不需要require('react')或import ... from ... 也能使用React
		// ,new webpack.ProvidePlugin({
		//     React: 'react',
		//     ReactDOM: 'react-dom'
		// })

		//压缩代码,命令行的 webpack -p 会默认使用这个插件压缩代码
		// ,new webpack.optimize.UglifyJsPlugin({
		//     compress: {
		//         warnings: false
		//     }
		// })

	]

	//webpack-dev-server的配置, 通常弄成独立的文件,比如server.js,
	//或者使用命令行形式,比如npm scripts命令行形式,类似webpack-dev-server -d --inline --hot
	//弄webpack-dev-server通常是为了自动刷新和热更新,配置麻烦
	// devServer: {
	//     contentBase: './',
	//     host: 'h5.baofeng.com',
	//     port: 9090, //默认8080
	//     inline: true //监控文件变化,自动重加载整个页面
	// }

};

// babel-polyfill用来转换ES2015新的对象和方法,在入口数组中,babel-polyfill必须在入口文件字符串前面,并且必须在入口文件代码的第一行import或require 'babel-polyfill'
for (let prop in config.entry) {
	config.entry[prop].unshift(
		'babel-polyfill'
	);
}

module.exports = config;