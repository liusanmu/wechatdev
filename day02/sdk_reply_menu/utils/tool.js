
//将xml数据转化未js对象
const {parseString} = require('xml2js')
//fs模块
const {writeFile, readFile} = require('fs');


module.exports = {
    /**
     * 获取用户发送数据
     * @param {*} req 
     */
    getUserDataAsync(req) {
        return new Promise((resolve, reject) => {
          let xmlData = '';
          req
            .on ('data', data => {
                //当流式数据传递过来后，会触发当前时间，会将数据注入到回调函数中
               // console.log(data);
                xmlData += data.toString();
            })
            .on('end', () => {
                //当数据接受完毕时，会触发当前时间
                resolve(xmlData);
            })
        })

    },

    /**
     * 将xml数据转化未js对象
     */
    parseXmlAsync(xmlData){
      return new Promise((resolve, reject) => {
        parseString(xmlData, {trim: true}, (err, res) =>{
            if(!err) {
              resolve(res);
            }else{
              reject('parseXmlAsync出现问题' + err)
            }
        })
      })
    },

    formatMessage(jsData) {
      let message = {};
      //获取xml
      jsData = jsData.xml;
      // 判断数据是否时一个对象
       for(let key in jsData) {
         //获取属性值
         let value = jsData[key];
         //过滤掉空的数据
         if(Array.isArray(value) && value > 0) {
           message[key] = value[0];
         }
       }
      return message;

    },

   writeFileAsyns(data, filName) {
     data = JSON.stringify(data);
     //const filePath = resolve(__dirname, filName);
     return new Promise((resolve, reject) => {
      writeFile(filName, data, err => {
        if (!err) {
          console.log('文件保存成功~');
          resolve();
        } else {
          reject('writeFileAsync方法出了问题：' + err);
        }
      })
    })

   },  

   readFileAsync (fileName) {
     console.log(fileName);
   // const filePath = resolve(__dirname, fileName);
    return new Promise((resolve, reject) => {
      readFile(fileName, (err, data) => {
        if (!err) {
          console.log('文件读取成功~');
          //将json字符串转化js对象
          data = JSON.parse(data);
          resolve(data);
        } else {
          reject('readFileAsync方法出了问题：' + err);
        }
      })
    })
  }


}