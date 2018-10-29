var cossdk = require("./cos-js-sdk-v4.js");
var cos = new cossdk.CosCloud({
    appid: 'xxx',
    bucket: 'xxx',
    region: 'xxx'
});
module.exports = cos
