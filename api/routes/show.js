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
var renderer = new marked.Renderer(); //初始化marked的渲染器
renderer.heading = function(text, level) {
    if (level < 4) {
        return '<h' + (level + 1) + '>' + text + '</h' + (level + 1) + '>'
    } else {
        return '<h' + level + '>' + text + '</h' + level + '>'
    }
}
renderer.image = function(href, title, alt) {
    return "<img data-original='" + href + "' alt ='" + alt + "'>";
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

router.use(utils.frontSession); //user和show共用1个session，存放在util内
//util
//getqr用来返回匹配网址的二维码
router.post('/getqr', function(req, res) {
    QRCode.toDataURL(req.body.url, {
        margin: 0
    }, function(err, url) {
        res.send(url)
    })
})
//简单测试接口
router.get('/helloworld', function(req, res) {
    res.send('service ready')
})
//获取标签全名，似乎可以整合到list路由中，但为了list的扩展，这里单独存在
router.get('/getfulltagname/:slug', function(req, res) {
    db.tags.findOne({
        slug: req.params.slug
    }, function(err, doc) {
        if (!doc) {
            return res.send('reject')
        }
        if (!doc) {
            return res.sendStatus(404);
        }
        res.send(doc.name)
    })
})
//当读取全部文章，计算总页码
router.get('/getpostpages/', function(req, res) {
    db.posts.count({
        "status.type": {
            $in: 'showing'
        }
    }, function(err, count) {
        res.send(String(Math.ceil(count / utils.loaderControl.blocksonpage)))
    })
})
//获取随机标签
router.get('/randomtags/:count', function(req, res) {
    db.tags.find({}, function(err, docs) {
        if (docs.length < req.params.count) {
            res.send(docs);
            return;
        }
        var randomtags = [];
        var index = 0;

        function getuniquetag() {
            index = Math.floor((Math.random() * docs.length)); //生成随机数
            if (randomtags.indexOf(docs[index]) != -1) {
                getuniquetag();
                return;
            }
            randomtags.push(docs[index]);
        }
        for (var i = 0, len = req.params.count; i < len; i++) {
            getuniquetag();
        }
        res.send(randomtags);
    })
})

//parts
//读取主页内容
router.get('/index', function(req, res) {
    var indexData = {}; //设置一个容器
    db.settings.findOne({
        _id: 'banner'
    }, function(err, doc) {
        indexData.banner = doc;
        indexData.loaderControl = utils.loaderControl;
        //首先查找Banner，然后把util中的数量设置读取进来
        db.posts.find({
                "status.type": {
                    $in: 'showing'
                }
            }).sort({
                date: -1
            }).limit(utils.loaderControl.blocksasync)
            .map(function(x) {
                return {
                    excerpt: x.excerpt,
                    title: x.title,
                    headerpic: x.dispheaderpic,
                    _id: x._id
                }
            })
            .exec(function(err, docs) {
                indexData.posts = docs;
                res.send(indexData);
            })
        //随后找出最新文章，加入容器发送
    })
})
//主页文章懒加载
router.get('/index/:page', function(req, res) {
    db.posts.find({
            "status.type": {
                $in: 'showing'
            }
        }).sort({
            date: -1
        }).skip(utils.loaderControl.blocksasync * req.params.page)
        .limit(utils.loaderControl.blocksasync)
        .map(function(x) {
            return {
                excerpt: x.excerpt,
                title: x.title,
                headerpic: x.dispheaderpic,
                _id: x._id
            }
        })
        .exec(function(err, docs) {
            res.send(docs);
        })

})

//读取指定文章内容
router.get('/post/:id', function(req, res) {
    db.posts.findOne({
        "_id": req.params.id //根据路由传入的id查找
    }, function(err, doc) {
        if (!doc || doc.status.type == 'deleted') { //如果已删除，返回404
            return res.send('reject')
        }
        if (doc.status.type != 'showing') {
            if (doc.author != req.session.userid) {
                return res.send('reject'); //如果不是展示状态，且不是作者本人查看返回404
            }
        }
        db.users.findOne({
            "_id": doc.author
        }, function(err, author) {
            doc.content = marked(doc.content);
            doc.authoravatar = author.avatarurl;
            doc.authornickname = author.nickname;
            doc.authorusername = author.username;
            if (req.session.signin) { //如果已登录，还需要读取当前用户的书签状态，信息等，用于评论
                db.users.findOne({
                    "_id": req.session.userid
                }, function(err, user) {
                    doc.loginuser = {
                        bmAdded: user.bm.indexOf(doc._id),
                        nickname: user.nickname,
                        avatar: user.avataruri,
                        email: user.email
                    }
                    res.send(doc)
                })
            } else {
                res.send(doc)
            }
        })
    })
})

function getUser(obj) {
    return function(cb) {
        db.users.findOne(obj, cb);
    }
}
//读取链接到文章的评论
router.get('/cmt/:id', function(req, res) {
    db.comments.find({
            "linkto": req.params.id
        }).sort({
            time: -1
        })
        .exec(function(err, docs) {
            co(function*() {
                for (var i = 0, len = docs.length; i < len; i++) {
                    if (docs[i].type != 'reg') { //如果没注册，读取信息，这个简单
                        docs[i] = {
                            author: docs[i].author,
                            content: docs[i].content,
                            avatarurl: docs[i].avatarUrl,
                            disptime: docs[i].disptime
                        }
                    } else {
                        var data = yield getUser({
                            email: docs[i].email
                        });
                        if (data) {
                            docs[i] = { //当是注册留言，有可能这是用户被删除了，所以如果data不存在会报错
                                author: data.nickname,
                                authorId: data.username,
                                content: docs[i].content,
                                avatarurl: data.avatarurl,
                                disptime: docs[i].disptime,
                                reg: true
                                //可惜，即使隐藏了报错，docs中会包含一个空对象，不过这可能会在json时消除
                            }
                        }
                    }
                }
                res.send(docs)
            })
        })
})


//添加评论
router.post('/cmt/add/', function(req, res) {
    var info = req.body;
    var doc = new db.comments();
    doc.linkto = info.target;
    doc.author = info.username;
    doc.email = info.email;
    doc.content = info.content;
    doc.avatarid = info.avatarid;
    if (info.type) {
        doc.type = info.type
    } else {
        doc.type = 'unreg'
    }
    doc.save(function(err) {
        utils.pushLogs('新评论追加了' + doc.linkto, 'show');
        res.send('ok')
    })
})
//获取文章列表
router.get('/list/post/:page', function(req, res) {
    db.posts.find({
            "status.type": {
                $in: 'showing'
            }
        }).sort({
            date: -1
        }).skip(utils.loaderControl.blocksonpage * (req.params.page - 1))
        .limit(utils.loaderControl.blocksonpage)
        //可以看到这里读取的是整页36篇，所以列表页没有懒加载的需求
        .map(function(x) {
            return {
                excerpt: x.excerpt,
                title: x.title,
                headerpic: x.dispheaderpic,
                _id: x._id
            }
        })
        .exec(function(err, docs) {
            res.send(docs);
        })
})

//获取标签文章
router.get('/list/tag/:tag/:page', function(req, res) {
    db.posts.find({
            "status.type": {
                $in: 'showing'
            },
            "tags.slug": req.params.tag
        }).sort({
            date: -1
        }).skip(utils.loaderControl.blocksonpage * (req.params.page - 1))
        .limit(utils.loaderControl.blocksonpage)
        .map(function(x) {
            return {
                excerpt: x.excerpt,
                title: x.title,
                headerpic: x.dispheaderpic,
                _id: x._id
            }
        })
        .exec(function(err, docs) {
            res.send(docs);
        })
})
//用户前端操作书签添加与删除，文章如果不存在，书签也就不会出现，所以这里没有逻辑问题
//不过这还不好说，尚不清楚cors的表现，如果可以通过api.nine00来调用，那问题就大了
router.get('/bm/:mode/:id', function(req, res) {
    db.users.findOne({
        _id: req.session.userid
    }, function(err, user) {
        switch (req.params.mode) {
            case "add":
                user.bm.push(req.params.id);
                user.save(function(err) {
                    res.send('ok')
                })
                break;
            case "remove":
                do {
                    var index = user.bm.indexOf(req.params.id);
                    if (index > -1) {
                        user.bm.splice(index, 1);
                    } else {
                        break;
                    }
                } while (index != -1)
                user.save(function(err) {
                    res.send("ok")
                })
                break;
        }
    })
})
//一个简易的正则搜索
router.get('/list/search/:value/:page', function(req, res) {
    var keywords = req.params.value.split(' ')
    if (keywords.length > 1) {
        var pstring = ''
        for (var i = 0; i < keywords.length; i++) {
            pstring += '(?=.*' + keywords[i] + ')';
        }
        pstring += '.*'
        var pattern = new RegExp(pstring);
    } else {
        var pattern = new RegExp(keywords);
    }
    db.posts.find({
            "status.type": {
                $in: 'showing'
            },
            title: {
                $regex: pattern
            }
        }).sort({
            date: -1
        }).skip(utils.loaderControl.blocksonpage * (req.params.page - 1))
        .limit(utils.loaderControl.blocksonpage)
        .map(function(x) {
            return {
                excerpt: x.excerpt,
                title: x.title,
                headerpic: x.dispheaderpic,
                _id: x._id
            }
        }).exec(function(err, docs) {
            res.send(docs)
        })
})
//获取用户页面
router.get('/userpage/:username', function(req, res) {
  var info = {
      final: false,
      posts: []
  }
    db.users.findOne({
        username: req.params.username
    }, function(err, user) {
        if (!user) {
            return res.send('reject')
        }
        if (user._id == req.session.userid) {
            info.editmode = true;
        }
        info.nickname = user.nickname;
        info.avatar = user.avatarurl;
        db.posts.find({
                "status.type": {
                    $in: 'showing'
                },
                author: user._id
            }).sort({
                date: -1
            }).map(function(x) {
                return {
                    excerpt: x.excerpt,
                    title: x.title,
                    headerpic: x.dispheaderpic,
                    _id: x._id
                }
            }).limit(utils.loaderControl.blocksasync)
            .exec(function(err, docs) {
                info.posts = docs;
                if(docs.length<utils.loaderControl.blocksasync){
                  info.final = true;
                }
                db.upsetting.findOne({
                    linkto: user._id
                }, function(err, doc) {
                    info.upsetting = doc;
                    res.send(info)
                })
            })
    })
})
router.get('/userpage/:username/:page', function(req, res) {
    var info = {
        final: false,
        posts: []
    }
    db.users.findOne({
        username: req.params.username
    }, function(err, user) {
        if (!user) {
            return res.send('reject')
        }
        db.posts.find({
                "status.type": {
                    $in: 'showing'
                },
                author: user._id
            }).sort({
                date: -1
            }).map(function(x) {
                return {
                    excerpt: x.excerpt,
                    title: x.title,
                    headerpic: x.dispheaderpic,
                    _id: x._id
                }
            })
            .skip(utils.loaderControl.blocksasync * req.params.page)
            .limit(utils.loaderControl.blocksasync)
            .exec(function(err, docs) {
                info.posts = docs;
                db.posts.count({
                    "status.type": {
                        $in: 'showing'
                    },
                    author: user._id
                }, function(err, count) {
                    if ((utils.loaderControl.blocksasync * req.params.page + utils.loaderControl.blocksasync) >= count) {
                        info.final = true;
                    }
                    res.send(info)

                })
            })
    })
})
router.post('/setuserpage', function(req, res) {
    var info = req.body;
    if (info.linkto == req.session.userid) {
        db.upsetting.findOne({
            linkto: req.session.userid
        }, function(err, setting) {
            setting.qq = info.qq;
            setting.wx = info.wx;
            setting.email = info.email;
            setting.wb = info.wb;
            setting.wxpublic = info.wxpublic;
            setting.save(function() {
                res.send('ok')
            })
        })
    } else {
        return ('not match')
    }
})
router.post('/setsignature', function(req, res) {
    var signature = req.body.signature;
    db.upsetting.update({
        linkto: req.session.userid
    }, {
        $set: {
            signature: signature
        }
    }, {}, function(err, numReplaced) {
        res.send('ok')
    });
})
router.post('/setuphp', function(req, res) {
    var uri = req.body.uri;
    db.upsetting.update({
        linkto: req.session.userid
    }, {
        $set: {
            headerpic: uri
        }
    }, {}, function(err, numReplaced) {
        res.send('ok')
    });
})

function levencompare(a, b) {
    return a.leven - b.leven
}
//关联文章
router.post('/relatedpost', function(req, res) {
    var taglist = [];
    var title = req.body.title;
    var tag = req.body.tag;
    for (var i = 0; i < tag.length; i++) {
        taglist.push(tag[i].slug)
    }
    db.posts.find({
            "status.type": {
                $in: 'showing'
            },
            "tags.slug": {
                $in: taglist
            }
        })
        .map(function(x) {
            return {
                excerpt: x.excerpt,
                title: x.title,
                headerpic: x.dispheaderpic,
                _id: x._id
            }
        })
        .exec(function(err, posts) {
            var levenlist = [];
            for (var i = 0; i < posts.length; i++) {
                var cur = {
                    index: i,
                    leven: leven(title, posts[i].title)
                }
                if (cur.leven == 0) {
                    continue;
                }
                levenlist.push(cur);
            }
            levenlist.sort(levencompare);
            var result = [];
            for (i = 0; i < 3; i++) {
                if (!levenlist[i]) {
                    break;
                }
                var target = levenlist[i].index;
                result.push(posts[target])
            }
            res.send(result);
        })
})

router.get('/getcollection/:slug', function(req, res) {
    var info = {}
    db.collect.findOne({
        slug: req.params.slug
    }, function(err, collect) {
        if (!collect) {
            return res.send('reject')
        }
        db.posts.find({
                "status.type": {
                    $in: 'showing'
                },
                _id: {
                    $in: collect.list
                }
            })
            .map(function(x) {
                return {
                    excerpt: x.excerpt,
                    title: x.title,
                    headerpic: x.dispheaderpic,
                    _id: x._id
                }
            })
            .exec(function(err, docs) {
                info.posts = docs;
                info.name = collect.name;
                info.hp = collect.disphp;
                info.hpmobi = collect.disphpmobi;
                res.send(info)
            })
    })
})

//侧边栏信息接口
//在前台，目前有三种类型页面，仅有post页面是立即获取登录状态的，所以侧边栏需要一个额外的信息接口，用于懒加载
//这个设计其实不错，这种接口方式的加载，藏起来的侧边栏很好的节省了通讯时间
//目前前台的设计只需要获取头像，所以这个路由更像是获取头像用的，如果后期有需求可以扩展或替换成头像接口
router.get('/sidebarstatus', function(req, res) {
    if (req.session.signin) {
        db.users.findOne({
            _id: req.session.userid
        }, function(err, user) {
            var info = {
                status: 'ok',
                avatar: user.avatarurl
            }
            res.send(info);
        })
    } else {
        res.sendStatus(200)
    }
})

module.exports = router;
