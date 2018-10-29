var db = require('../models/db.js');
var CryptoJS = require("crypto-js");

function pushLogs(message, type) {
    var doc = new db.logs();
    doc.type = type;
    doc.message = message;
    doc.save();
}

var loaderControl = {
    blocksasync: 12,
    blocksonpage: 36,
    commentasync: 12,
}


var session = require('express-session'); //cookie session
var LevelStore = require('level-session-store')(session);
var frontSession = session({
    secret: 'xxx',
    name: 'user',
    resave: false,
    saveUninitialized: true,
    store: new LevelStore('../data/session.db')
})

var backSession = session({
  secret: 'xxx',
  name: 'token',
  resave: false,
  saveUninitialized: true,
  store: new LevelStore('../data/susession.db')
})

var bucketSetting = {
  appid:'xxx',
  bucket:'xxx',
  sid:'xxx',
  skey:'xxx'
}

function generateAppSign(mode, path) {
    var setting = bucketSetting;
    var random = parseInt(Math.random() * Math.pow(2, 32));
    var now = parseInt(Date.now() / 1000);
    if (!mode) {
        var expire = now + 86400;
        var path = ''; //多次签名这里填空
    } else {
        var expire = 0;
        var path = path;
    }
    var str = 'a=' + setting.appid + '&k=' + setting.sid + '&e=' + expire + '&t=' + now + '&r=' + random +
        '&f=' + path + '&b=' + setting.bucket;
    var sha1Res = CryptoJS.HmacSHA1(str, setting.skey); //这里使用CryptoJS计算sha1值，你也可以用其他开源库或自己实现
    var strWordArray = CryptoJS.enc.Utf8.parse(str);
    var resWordArray = sha1Res.concat(strWordArray);
    var res = resWordArray.toString(CryptoJS.enc.Base64);
    return res;
}

module.exports.pushLogs = pushLogs;
module.exports.loaderControl = loaderControl;
module.exports.frontSession = frontSession;
module.exports.backSession = backSession;
module.exports.generateAppSign = generateAppSign;
