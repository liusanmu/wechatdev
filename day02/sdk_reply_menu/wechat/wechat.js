
/**
 * 获取access_token
 * 什么?微信调用全局唯一凭据
 *
 * 特点：
 *      1.唯一的
 *      2.有效期为2小时
 *      3.接口权限 每天2000次
 *
 *      https请求方式: GET
       https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

        设计思路
         1.首次本地没有，发送请求获取access_token ,保存下来（本地文件）
         2.第二次或以后
            -先去读取本地文件，判断它是否过期
               -过期了
                  -重新请求获取access_token，保存下来覆盖之前的文件（保证文件是唯一的）
 *             -没有过期
 *                -直接使用
 *
 *
 */
const  rp = require('request-promise-native');
const  request = require("request");
//fs模块
const {writeFile, readFile} = require('fs');

//path
//const {resolve, join} = require("path");

const {appID, appsecret} = require('../config');

const menu = require('./menu')

const api = require('../utils/api')

const {writeFileAsyns,readFileAsync} =  require('../utils/tool')

//定义一个类获取access_token
class Wechat{

    constructor() {

    }

    /**
     * 获取access_token
     */
    getAccessToken() {
        //定义请求的参数
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`

        /*
         request
         request-promise-native  返回值是一个promise对象
        */
      return new Promise((resolve, reject)=>{
          //发送请求
          rp({method: 'GET', url,json: true})
              .then(res =>{
                  //console.log(res);
                  /*
                  { access_token: '13_DGddvcTZ4HPm8tjcHGwnDAtk9LbNQMA_h_D3ffxcncMsJwGgfCUaLChd_pPjHb4ilxeyOr8adZ9iOv14unJyK7q4qPYO8ekPPCuXvMDu-t9hBURiwKWriNuP4HzvEVNQ2JoATXwCGrOwqwjgKJUaABAXWH',
                   expires_in: 7200 }
                   */
                  //设置access_token的过期时间
                  res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                  //将promise 对象状态改成成功的状态
                  resolve(res);


              })
              .catch(err =>{
                  console.log(err);
                  reject("getAccessToken出了问题:"+ err);
              })
        })
    }


    /**
     * 保存access_token到本地
     * @param accessToken 保存的凭据
     */
    saveAccessToken(accessToken){
        accessToken = JSON.stringify(accessToken);
            return new Promise((resolve,reject)=>{

              writeFile('./accessToken.txt', accessToken, err =>{
                  if (!err){
                      console.log('文件保存成功');
                      resolve();
                  } else {
                      reject('saveAccessToken出了问题' + err);
                  }
              })
            }) ;
    }

    /**
     * 读取access_token
     */
    readAccessToken(){
        return new Promise((resolve, reject) =>{
            readFile("./accessToken.txt", (err, data) =>{
                if (!err) {
                    console.log('文件读取成功');
                    //将json字符串转化js
                    data = JSON.parse(data);
                    resolve(data);
                }else {
                    reject('readAccessToken出错' + err);
                }
            })
        })
    }


    /**
     * 检查access_token是否有效
     * @param accessToken
     */
    isValidAccessToken(data){
        if (!data && data.access_token && !data.expires_in){

            return false;
        }
      /*if (data.expires_in <Date.now()){
            return false;
        } else {
            return true;
        }*/
      return data.expires_in > Date.now();

    }

    /**
     *用于获取没有过期的accessToken
     ***箭头函数的this是最外层的this
     */
    fetchAccessToken(){
        // 说明之前保存过access_token ，并且他是有效的
        if(this.access_token && this.expires_in && this.isValidAccessToken){
            return Promise.resolve({
                access_token: this.access_token,
                expires_in: this.expires_in
            });
        }

        return this.readAccessToken()
        .then(async res =>{
            //获取到access_token,并未过期
            if(this.isValidAccessToken(res)){
                return Promise.resolve(res);
            }else{
              //获取到access_token,但是过期了
              //发送请求获取access_token(getAccessToken)，
                const res = await this.getAccessToken();
               //保存下来（本地文件）(saveAccessToken)
                await this.saveAccessToken(res);
                 //将请求回来的access_token返回出去
                return Promise.resolve(res);

            }

        }).catch( async err => {
                // 本地没有文件
                // 发送请求获取access_token(getAccessToken)，
                const res = await this.getAccessToken();
                //保存下来（本地文件）(saveAccessToken)
                await this.saveAccessToken(res);
                // 将请求回来的access_token返回出去
                return Promise.resolve(res);
            }

        ).then(res=>{
             //将access_token挂载到this上
            this.access_token = res.access_token;
            this.expires_in = res.expires_in;
              //返回res包装了一层promise对象（此对象为成功的状态）
        //是this.readAccessToken()最终的返回值
            return Promise.resolve(res)
        }

        )
    }


    /////获取jsapi ticket////////////////////
     /**
     * 获取jsapiticket
     */
  getTicket() {
      //定义请求的参数
   
    return new Promise(async(resolve, reject)=>{
      const data =  await this.fetchAccessToken();
      const url =  `${api.ticket}&access_token=${data.access_token}`;
      
        //发送请求
        rp({method: 'GET', url,json: true})
            .then(res =>{

                resolve({
                  ticket: res.ticket,
                  expires_in:  Date.now() + (res.expires_in - 300) * 1000
                });
            })
            .catch(err =>{

                reject("getTicket出了问题:"+ err);
            })
      })
  }


  /**
   * 保存jsapiticket到本地
   * @param jsapiticket 保存的凭据
   */
  saveTicket(ticket){
    return writeFileAsyns(ticket,'ticket.txt')
  }

  /**
   * 读取jsapiticket
   */
  readTicket(){
      return readFileAsync('ticket.txt');
  }


  /**
   * 检查jsapiticket是否有效
   * @param accessToken
   */
  isValidTicket(data){
      if (!data && data.ticket && !data.expires_in){
          return false;
      }
    /*if (data.expires_in <Date.now()){
          return false;
      } else {
          return true;
      }*/
    return data.expires_in > Date.now();

  }

  /**
   *用于获取没有过期的jsapiticket
   ***箭头函数的this是最外层的this
   */
  fetchTicket(){

      // 说明之前保存过ticket ，并且他是有效的
      if(this.ticket && this.ticket_expires_in && this.isValidTicket){
          return Promise.resolve({
              ticket: this.ticket,
              expires_in: this.ticket_expires_in
          });
      }

      return this.readTicket()
      .then(async res =>{

          //获取到Ticket,并未过期
          if(this.isValidTicket(res)){

              return Promise.resolve(res);
          }else{

            //获取到Ticket,但是过期了
            //发送请求获取Ticket(getTicket)，
              const res = await this.getTicket();

             //保存下来（本地文件）(saveTicket)
              await this.saveTicket(res);
               //将请求回来的Ticket返回出去
              return Promise.resolve(res);

          }

      }).catch( async err => {
              // 本地没有文件
              // 发送请求获取Ticket(getTicket)，
              const res = await this.getTicket();

              //保存下来（本地文件）(saveTicket)
              await this.saveTicket(res);
              // 将请求回来的Ticket返回出去
              return Promise.resolve(res);
          }

      ).then(res=>{
           //将ticket挂载到this上
          this.ticket = res.ticket;
          this.ticket_expires_in = res.expires_in;
            //返回res包装了一层promise对象（此对象为成功的状态）
          //是this.readTicket()最终的返回值
          return Promise.resolve(res)
      })
  }



    createMenu(menu){
        return new Promise(async (resolve,reject) =>{

          try {
             //获取access_token
          const data = await this.fetchAccessToken();
          nsole.log(menu);
          const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${data.access_token}`;

          const result = await rp({method:'POST', url, json:true, body:menu });

          resolve(result);
          } catch (error) {
            reject('createMenu' + error)
          }
     

      })
    }

    deleteMenu(){
      return new Promise(async(resolve,reject) => {
          try {
            const data = await this.fetchAccessToken();
            const url = ` https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${data.access_token}`;
            const result = await rp({method:'GET', url, json:true});
            resolve(result);

          } catch (error) {
            reject('deleteMenu' + error);
          }
      })
    }

}

//模拟测试
//const  w = new Wechat();
(async ()=>{
  const w = new Wechat();
  //et result = await w.deleteMenu();
  //console.log(result);
 // result = await w.createMenu(menu);
 console.log('---------------------------------------------');
 let result11 = await w.fetchTicket();
 console.log(result11);
 console.log('---------------------------------------------');
//
})()


/*

整理思路：
       读取本地文件（readAccessToken）
          - 本地有文件
            - 判断它是否过期(isValidAccessToken)
          - 过期了
            - 重新请求获取access_token(getAccessToken)，保存下来覆盖之前的文件（保证文件是唯一的）(saveAccessToken)
          - 没有过期
            - 直接使用
        - 本地没有文件
           - 发送请求获取access_token(getAccessToken)，保存下来（本地文件）(saveAccessToken)，直接使用*/

//为了返回accesstoken
// new Promise((resolve, reject) => {
//     w.readAccessToken()
//         .then(res => {
//             //本地有文件
//             //判断是否过期
//             if (w.isValidAccessToken(res)){

//                 resolve(res);
//             } else {
//                 //过期了
//                 //发送请求获取access_token
//                 w.getAccessToken()
//                     .then(res => {
//                         w.saveAccessToken(res)
//                             .then(()=>{
//                                 resolve(res)
//                             })
//                 })
//             }
//         })
//         .catch(err => {
//             //本地没有文件
//             //发送请求获取access_token
//             w.getAccessToken()
//                 .then(res => {
//                     w.saveAccessToken(res)
//                         .then(()=>{
//                             resolve(res)
//                         })
//              })
//         })

// }).then(res => {
//     console.log(res);
// })
