
const prefix = 'https://api.weixin.qq.com/cgi-bin/';
module.exports = {
  accessToken: `${prefix}/?grant_type=client_credential&appid`,
  ticket:`${prefix}ticket/getticket?type=jsapi`,
  menu: {
    create: `${prefix}menu/create?`,
    delete: `${prefix}menu/delete?`
  }

}