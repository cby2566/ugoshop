module.exports = {
  //entry:  __dirname + "/app/main.js",//已多次提及的唯一入口文件
  //__dirname为config所在目录
  entry:{
	  'home' :[__dirname + "/src/js/home.js"]
  },
  output: {
    path: __dirname + "/src/js/homepage",//打包后的文件存放的地方
    filename: "[name].js"//打包后输出文件的文件名
  },
  mode:'development',
  devServer: {
    contentBase: "./src",//本地服务器所加载的页面所在的目录,目录有点东西（http://localhost:8089/html/homepage.html）
    historyApiFallback: true,//不跳转
    inline: true,//实时刷新
	port:8089,
  },
	// 加载器配置
   module:{
	   rules: [
		//编译es6->es5：babel(babel-loader,babel-core,babel-preset-env)
            {
                test:/\.js$/,
                exclude:__dirname+'/node_modules',
                use:{
                    loader:'babel-loader',
                    // 配置loader选项
                    options:{
                        presets:['env','stage-3'], //编译ES6->ES5
                    }
                }
            },
	   ]
   } 
}