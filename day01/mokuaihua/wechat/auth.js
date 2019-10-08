/**
 * 验证服务器有效性模块
 * @returns {Function}
 */

////引入sha1
const sha1 = require("sha1");

//引入conifg 模块
const config = require("../config");

//中间件函数为了更好的传递参数
module.exports = () => {

    return (req, res, next) => {

        //微信服务器发送的参数
        // console.log(req.query);

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
    }
}