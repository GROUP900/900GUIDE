var express = require('express');
var bodyParser = require('body-parser'); //body-parser
var db = require('./models/db.js'); //Linvodb3 & schema
var randomString = require('crypto-random-string'); //generate random chars
var md5 = require('md5'); //md5 decode
var session = require('express-session'); //cookie session
var utils = require('./lib/utils.js');
var Raven = require('raven');
var cors = require('cors');
var sm = require('sitemap');
var fs = require('fs');
var schedule = require('node-schedule');

// 4:30生成sitemap
function generateSitemap(){
  db.posts.find({
          "status.type": {
              $in: 'showing'
          }
      }).map(
    function(x){
      return {
        url: x._id,
        changefreq: 'daily',
        priority: 0.3
      }
    }).exec(function(err,list){
      var sitemap = sm.createSitemap ({
            hostname: 'https://www.nine00.com/r/post/',
            cacheTime: 24*60*60,        // 600 sec - cache purge period
            urls: list
          });
      fs.writeFileSync("./sitemap.xml", sitemap.toString());
      console.log('sitemap已更新')
    })
}
generateSitemap();
schedule.scheduleJob('0 30 4 * * ?', function(){
  generateSitemap();
});

// Raven.config('https://396904e9170f4f0c871c6567e6ae01fb:f5cfa298bdc04bf1b743c986d5c3d99b@sentry.io/157337').install()

var show = require('./routes/show'); //load front routes
var user = require('./routes/user'); //load userpanel routes
var su = require('./routes/su'); //load admin routes
var render = require('./routes/render'); //load render routes

var app = express(); //start instance]

// var whitelist = ['http://www.nine00.com', 'http://su.nine00.com']
// var corsOptions = {
//     origin: function(origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     },
//     credentials: true
// }


// app.use(Raven.requestHandler());
//settings
app.disable('x-powered-by');

//init middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())

//load routes
app.get('/sitemap.xml', function(req, res) {
  var stream = fs.createReadStream('./sitemap.xml', {
      flags: 'r'
  });
  stream.pipe(res);
});
app.use('/r', render);
// app.use(cors(corsOptions))
app.use('/show', show);
app.use('/user', user);
app.use('/su', su);


// app.use(Raven.errorHandler());

app.use(function (err, req, res, next) {
  if (err.message !== 'Not allowed by CORS') return next()
  res.send('Nooooooooooooo')
});

app.use(function(req, res) {
    res.status(500);
    res.send('500');
});

app.listen(3030, function() {
    console.log('API测试服务器启动，运行在端口3030')
})
