/**
 * 验证服务器有效性模块
 * @returns {Function}
 */

////引入sha1
const sha1 = require("sha1");

//引入conifg 模块
const config = require("../config");

//引入工具类
const {getUserDataAsync, parseXmlAsync, formatMessage} = require('../utils/tool');

//引入template
const template = require('./template');

const reply = require('./reply');

//中间件函数为了更好的传递参数
module.exports = () => {

    return async (req, res, next) => {

        //微信服务器发送的参数
       console.log(req.query);

        //解构赋值
        const {signature, echostr, timestamp, nonce} = req.query;
        const {token} = config;

        //结合你微信发给的token，timestamp和 nonce 按照字典排序并在一起组合成一个数组
       // const arr = [timestamp, nonce,token];
        // const arrSort = arr.sort();
        // console.log(arrSort);
        // // sha1加密
        // const str = arr.join('');
        // console.log("strjoin" + str);

        // const sha1Str = sha1(str);
        // console.log("sha1Str" + sha1Str);
        const sha1Str = sha1([timestamp, nonce,token].sort().join(''))
       

        /**
         * 微信服务器会发送两种类型的消息给服务器
         *  1.GETq请求
         *    -验证服务器有效性
         *  2.POST请求
         *    -微信服务器会将用户发送的数据以POST请求转发到开发者服务器
         */
        // -验证服务器有效性
        if(req.method === 'GET'){
          console.log(sha1Str);
          console.log(signature);
            //对比
            if (sha1Str === signature) {
                res.send(echostr);
                console.log("验证成功");
            }else {
                res.end("error1");
                console.log("验证失败");
            }
            //-微信服务器会将用户发送的数据以POST请求转发到开发者服务器
        }else if (req.method === 'POST') {
            //说明消息不是来自与微信服务器
          if(sha1 === signature){
              res.end('error2')
          }  

          //接受请求体的数据，L流式数据，并转换为指定类型的js对象 
          const xmlData = await getUserDataAsync(req);
          const jsData = await parseXmlAsync(xmlData);
          const message = formatMessage(jsData);


          let options = {
            toUserName: message.FromUserName,
            fromUserName: message.ToUserName,
            createTime: Date.now(),
            msgType: 'text'

          }
          let content = '您在说什么，我听不懂？'
         
          options.content = content;
   
          let replyMessage = template(options);
           console.log(replyMessage);

           //返回响应给微信服务器
           res.send(replyMessage);
          
          
       
        //如果开发者服务器没有返回响应给微信服务器，则微信服务器会发送三次请求
        //res.end('');

        }else{
            res.send('error133');
        }

      //接受请求体的数据，流失数据 
    //   const xmlData = await getUserDataAsync(req);
    //   console.log(xmlData);

    //   const jsData = await parseXmlAsync(xmlData);
    //   console.log(jsData)
    //  const message = formatMessage(jsData);
    //  console.log(message)
     /**
      * <xml>
      *
      <FromUserName><![CDATA[oGUoqs57YQJ8ChK_zPIwkbycNcOs]]></FromUserName>
      <CreateTime>1569927156</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[得到]]></Content>
      <MsgId>22475952200254051</MsgId>
      </xml>

      */

  /* <xml>
        <ToUserName><![CDATA[gh_4b6b864986b1]]></ToUserName>
        <FromUserName><![CDATA[oGUoqs57YQJ8ChK_zPIwkbycNcOs]]></FromUserName>
        <CreateTime>1569919325</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[dddd]]></Content>
        <MsgId>22475841311548205</MsgId>//消息id 微信服务器默认保存3天用户发送的数据，这3天可以通过此
                                    //id在微信服务器找到消息
   </xml>
    */




       
    }
}