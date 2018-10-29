var express = require('express');
var router = express.Router();
var db = require('../models/db.js'); //Linvodb3 & schema
var co = require('co');
var utils = require('../lib/utils.js');
var md5 = require('md5');
var randomString = require('crypto-random-string');
var QRCode = require('qrcode');
var marked = require('marked');
var leven = require('leven');
// walkthough
var ejs = require('ejs');
var template = ejs.compile("<%- include('template'); %>", {_with:false,cache:true,filename:process.cwd()+'/view/template.ejs'});
var renderer = new marked.Renderer(); //初始化marked的渲染器
renderer.heading = function(text, level) {
    if (level < 4) {
        return '<h' + (level + 1) + '>' + text + '</h' + (level + 1) + '>'
    } else {
        return '<h' + level + '>' + text + '</h' + level + '>'
    }
}
renderer.image = function(href, title, alt) {
    return "<img src='" + href + "' alt ='" + alt + "'>";
}
renderer.html = function(html) {
    if (html.indexOf('<iframe') > -1) {
        return "<div class='aspect-ratio'>" + html + '</div>'
    } else {
        return html
    }
}
renderer.paragraph = function(text) {
    if (text.substr(0,4)=='<img' && text.substr(-1,1)=='>'){
        return text;
        }
    else{
        return '<p>' + text + '</p>';}

}
marked.setOptions({
    renderer: renderer
})

router.get('/list/:page', function(req, res) {
var data = {};
db.posts.find({
        "status.type": {
            $in: 'showing'
        }
    }).sort({
        date: -1
    }).limit(60)
    .skip(60*(req.params.page-1))
    .map(function(x) {
        return {
            title: x.title,
            dispdate: x.dispdate,
            _id: x._id
        }
    })
    .exec(function(err, docs) {
      data.docs = docs;
      if(docs.length>60){
        data.page = ++req.params.page;
      }
      data.template = 'list';
      res.send(template({data: data}));
    })
})

router.get('/post/:id', function(req, res) {
  var data = {};
  db.posts.findOne({
      "_id": req.params.id //根据路由传入的id查找
  }, function(err, doc) {
    if(!doc){
      res.redirect('https://www.nine00.com');
      return;
    }
    db.users.findOne({
        "_id": doc.author
    }, function(err, author) {
      var currenthref = 'http://www.nine00.com/r/post/'+doc._id;
      data.origin = 'https://www.nine00.com/show/post/'+doc._id;
      data.date = doc.dispdate;
      data.hpurl = doc.dispheaderpic;
      data.title = doc.title;
      data.content = marked(doc.content);
      data.excerpt = doc.excerpt;
      data.avatar = author.avatarurl;
      data.author = author.nickname;
      data.wblink = 'http://service.weibo.com/share/share.php?appkey=1444895989&title='+encodeURIComponent(doc.title+'-900指南')+'&url='+encodeURIComponent(currenthref)+'&searchPic=true';
      QRCode.toDataURL(data.origin, {
          margin: 0
      }, function(err, url) {
        data.qrlink = url;
        db.comments.find({
                "linkto":doc._id
            }).sort({
                time: -1,
                limit:6
            })
            .exec(function(err, comments) {
              data.template = 'post';
              data.comments = comments;
              res.send(template({data: data}));
            })
      })

    })

  })
})


module.exports = router;
