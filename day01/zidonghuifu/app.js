/**
 * 验证服务器有效性
 * liuSEN37927
 * @type {*}
 */
//引入express
const express = require("express");

const auth = require("./wechat/auth")

//创建app应用对象
const app = express();


//use可以接受所有消息
app.use(auth());

//监听端口号
app.listen(3000,() => console.log('服务启动成功!!'));