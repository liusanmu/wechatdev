/**
 * 验证服务器有效性
 * liuSEN37927
 * @type {*}
 */
//引入express
const express = require("express");
const sha1 = require("sha1");
const app = express();

/**
 * 1.微信服务器要知道开发者服务器是哪个
 * -测试号管理页面填写url开发者服务器地址
 *    -使用ngrok 内网穿透 将本地端口号开启的服务映射外网跨域访问一个地址
 *    -ngrok http 3000
 *    -填写token
 *       -参与微信签名加密的一个参数
 * 2.开发者服务器  -验证消息是否来自微信服务器
 *  目的：计算得出signature 微信加密签名，和微信传递过来的signature对比，如果咿呀红，说明消息来自微信服务器，如果不一样，说明不是微信服务器发送到的消息
 *     --结合你的token，timestamp和 nonce 按照字典排序并在一起组合成一个数组
 *     -将数组里所有参数拼接成一个字符串 ，进行sha1加密
 *     -
 */


const config = {
    token: 'liusanmu37927',
    appID: 'wx18e7d69e9fdc389b',
    appsecret: '33c56b017ffca7783e9a175242df74aa'
}

//use可以接受所有消息
app.use((req, res, next) => {
    //微信服务器发送的参数

   // console.log(req.query);
     /*{ signature: '817fa35b49645453aedc91e1be95b28eea0cfb11',  //微信的加密签名
         echostr: '8651176180094726399',  //微信的随机字符串
         timestamp: '1569808623',  //
         nonce: '1220150618' }  //随机数字*/

     //解构赋值
     const {signature, echostr, timestamp, nonce} = req.query;
     const {token} = config;

     //结合你微信发给的token，timestamp和 nonce 按照字典排序并在一起组合成一个数组
    const arr = [timestamp, nonce,token];

    const arrSort = arr.sort();
    console.log(arrSort);
    // sha1加密
    const str = arr.join('');
    console.log("strjoin" + str);

    const sha1Str = sha1(str);
    console.log("sha1Str" + sha1Str);

    //对比
    if (sha1Str === signature) {
        res.send(echostr);
        console.log("验证成功");
    }else {
        res.end("error");
        console.log("验证失败");
    }


});

//监听端口号
app.listen(3000,() => console.log('服务启动成功!!'));