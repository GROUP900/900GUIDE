var express = require('express');
var router = express.Router();
var db = require('../models/db.js'); //Linvodb3 & schema
var utils = require('../lib/utils.js');
var md5 = require('md5');
var randomString = require('crypto-random-string');
var QRCode = require('qrcode');
var nodemailer = require('nodemailer');
var co = require('co');

router.use(utils.frontSession);
//从util里读取和show公用的session
var mailconfig = {
    host: 'xxx',
    port: 994,
    secure: true,
    auth: {
        user: 'xxx',
        pass: 'xxx'
    }
}
var transporter = nodemailer.createTransport(mailconfig);
transporter.verify(function(error, success) {
    if (error) {
        return console.log('邮件服务器挂了');
    }
    console.log('邮件服务器准备OK');
});
//设置和验证邮件服务器

//注册页
router.post('/signup', function(req, res) {
    var info = req.body;
    var mailp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var usernamep = /[a-zA-Z0-9]/;
    if (!info.email || !info.username || !info.nickname || !info.password || !usernamep.test(info.username) || !mailp.test(info.email)) {
        return 'reject'
    }
    var doc = new db.users;
    doc.username = info.username;
    //创建文档并一步步保存，当出现错误删除(重名)文档并返回问题
    doc.save(function(err) {
        if (err) {
            doc.remove();
            return res.send('username')
        }
        doc.email = info.email;
        doc.save(function(err) {
            if (err) {
                doc.remove();
                return res.send('email')
            }
            doc.nickname = info.nickname;
            doc.save(function(err) {
                if (err) {
                    doc.remove();
                    return res.send('nickname')
                }
                doc.salt = randomString(15);
                doc.pass = md5(info.password + doc.salt);
                doc.save(function(err) {
                    res.send('ok')
                    var ups = new db.upsetting;
                    ups.linkto = doc._id;
                    ups.save();
                    utils.pushLogs('新用户注册了' + doc.nickname, 'user');
                })
            })
        })
    })
})
//登录
router.post('/signin', function(req, res) {
    var info = req.body;
    //在任何操作前重建session,找回密码可能存在残留（主要是第三部的修改密码状态，密码只能重置一次，但不能保证用户离开后又借助状态修改密码造成不安全，无法在其离开时得到提示，只能退而求其次，在登录时清空他们的session）
    req.session.regenerate(function(err) {
        switch (info.step) {
            //第一步，邮箱验证，如果邮件存在，返回对应的头像
            case 1:
                db.users.findOne({
                        'email': info.email
                    })
                    .map(function(x) {
                        return {
                            avatar: x.avatarurl
                        }
                    }).exec(function(err, doc) {
                        if (doc == null) {
                            return res.send('bad')
                        }
                        res.send(doc.avatar);
                    });
                break;
            case 2:
                //第二部，登录，通过email找到用户，如果密码匹配继续
                db.users.findOne({
                    'email': info.email
                }, function(err, doc) {
                    if (!doc || md5(info.password + doc.salt) != doc.pass) {
                        return res.send('bad')
                    }
                    if (doc.status == 'banned') {
                        return res.send('banned');
                    }
                    //匹配后，把用户信息（doc）存储到session.userinfo，方便取用
                    //同时设置一个signin标志用来判断登录状态
                    //一定要在登出时摧毁整个session
                    req.session.signin = true;
                    req.session.userid = doc._id;
                    //doc是临时的，所以说每次用户修改信息，都要重新保存一次userinfo保证显示数据最新，这没必要了，如果忘了保存会出现很多漏洞，这里改为只保留不变得id，用id查信息

                    //设置cookie过期时间，如果保持登录的话，cookie可以随意修改过期时间，所以说过期时间可能无限长，这是个问题
                    if (req.body.remember) {
                        req.session.cookie.expires = new Date(Date.now() + 604800000);
                    } else {
                        req.session.cookie.expires = false;
                    }
                    res.send('ok')

                })
        }
    })
})
//找回密码
router.post('/retrivepw', function(req, res) {
    switch (req.body.step) {
        //第一步，生成代码并发送邮件
        case 1:

            req.session.retrivecode = randomString(15);
            req.session.email = req.body.email;
            req.session.cookie.expires = new Date(Date.now() + 600000);
            var retrivepwplate = {
                from: '900 <bot@nine00.com>',
                to: req.body.email,
                subject: '找回密码',
                html: '你正在找回密码，代码是： <b>' + req.session.retrivecode + '</b>，10分钟内有效。如非本人操作，请立即删除本邮件，注意账号安全。（自动发送，不要回复）'
            };
            transporter.sendMail(retrivepwplate, function(err) {
                if (err) {
                    return res.send('error');
                } else {
                    res.send('ok')
                }
            });
            break;
        case 2:

            if (!req.session.retrivecode) {
                return res.send('timeout');
            }
            if (req.body.secret == req.session.retrivecode) {
                req.session.cookie.expires = false;
                res.send('ok')
            } else {
                res.send('bad')
            }
            break;

        case 3:
            if (req.body.secret != req.session.retrivecode) {

                return res.send('bad')
            }
            db.users.findOne({
                email: req.session.email
            }, function(err, doc) {
                doc.salt = randomString(15);
                doc.pass = md5(req.body.password + doc.salt);
                doc.save(function(err) {
                    req.session.destroy() //当成功保存，销毁session，不可能无限进入第三步，所以同样的信息，密码只能重置一回
                    res.send('ok')
                })
            })
            break;
    }
})

router.post('/getavatarviamail', function(req, res) {
    db.users.findOne({
        email: req.body.email
    }, function(err, user) {
        res.send(user.avatarurl);
    })
})

//插入一个中间件，判断session的signin,这个标志是在signin第二部设置的，如果没有signin标志，统一返回sessionlost
router.use(function(req, res, next) {
    if (req.session.signin) {
        next();
    } else {
        res.send('session lost')
    }
});

router.get('/loginstatus', function(req, res) {
    db.users.findOne({
        _id: req.session.userid
    }, function(err, user) {
        if (user.status != 'active' || user == null) {
            req.session.destroy(function(err) {
                return res.send('bad');
            })
        } else {
            res.send('letgo');
        };
    })
})

router.get('/getbm', function(req, res) {
  var info = {
      final: false,
      posts: []
  }
    db.users.findOne({
        _id: req.session.userid
    }, function(err, user) {
        db.posts.find({
                "status.type": {
                    $in: 'showing'
                },
                _id: {
                    $in: user.bm
                }
            })
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
                info.posts = docs;
                if(docs.length<utils.loaderControl.blocksasync){
                  info.final = true;
                }
                res.send(info)
            })
    })
})

router.get('/getbm/:page', function(req, res) {
    var info = {
        final: false,
        posts: []
    }
    db.users.findOne({
        _id: req.session.userid
    }, function(err, user) {
        db.posts.find({
                "status.type": {
                    $in: 'showing'
                },
                _id: {
                    $in: user.bm
                }
            })
            .skip(utils.loaderControl.blocksasync * req.params.page)
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
                info.posts = docs;
                db.posts.count({
                    "status.type": {
                        $in: 'showing'
                    },
                    _id: {
                        $in: user.bm
                    }
                }, function(err, count) {
                    if ((utils.loaderControl.blocksasync * req.params.page + utils.loaderControl.blocksasync) >= count) {
                        info.final = true;
                    }
                    res.send(info)

                })
            })
    })
})

router.post('/removebm', function(req, res) {
    db.users.findOne({
        _id: req.session.userid
    }, function(err, user) {
        for (var i = 0, len = req.body.length; i < len; i++) {
            var index = user.bm.indexOf(req.body[i]);
            if (index < 0) continue;
            user.bm.splice(index, 1);
        }
        user.save(function(err) {
            res.send('ok')
        })
    })
})

router.get('/setting/get', function(req, res) {
    db.users.findOne({
            _id: req.session.userid
        })
        .map(function(x) {
            return {
                nickname: x.nickname,
                contact: x.contact,
                email: x.email,
                avatarUrl: x.avatarurl,
                username: x.username
            }
        }).exec(function(err, info) {
            res.send(info)
        })
})

router.post('/setting/set', function(req, res) {
    var data = req.body;
    db.users.findOne({
        _id: req.session.userid
    }, function(err, user) {
        switch (data.type) {
            case 'contact':
            case 'nickname':
                if (!data.value) {
                    return res.send('empty')
                }
                user[data.type] = data.value;
                break;
            case "pw":
                if (!data.newpw) {
                    return res.send('empty')
                }
                if (md5(data.oldpw + user.salt) != user.pass) {
                    return res.send('wrongpw')
                }
                user.salt = randomString(15);
                user.pass = md5(data.newpw + user.salt);
                break;
        }
        user.save(function(err) {
            if (err) {
                return res.send('unknown')
            }
            if (data.type == 'pw') {
                return res.send('pwok')
            }
            res.send('ok')
        })
    })
})

router.post('/resetemail', function(req, res) {
    switch (req.body.step) {
        case 1:
            db.users.findOne({
                _id: req.session.userid
            }, function(err, user) {
                req.session.retrivecode = randomString(15);
                var resetmailplate = {
                    from: '900 <bot@nine00.com>',
                    to: user.email,
                    subject: '修改邮箱',
                    html: '你正在修改邮箱，代码是： <b>' + req.session.retrivecode + '</b>。如非本人操作，请立即删除本邮件，请马上修改你的登录密码。（自动发送，不要回复）'
                };
                transporter.sendMail(resetmailplate, function(err) {
                    if (err) {
                        return res.send('error');
                    } else {
                        res.send('ok')
                    }
                });
            })
            break;
        case 2:
            var data = req.body;
            db.users.findOne({
                _id: req.session.userid
            }, function(err, user) {
                if (md5(data.pw + user.salt) != user.pass) {
                    return res.send('wrongpw')
                }
                if (data.secret != req.session.retrivecode) {
                    return res.send('wrongsecret')
                }
                var mailp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!mailp.test(data.newmail)) {
                    return res.send('wrongemail')
                }
                user.email = data.newmail
                user.save(function(err) {
                    if (err) {
                        return res.send('unknown')
                    }
                    delete req.session.retrivecode;
                    res.send('ok')
                })
            })
            break;
    }
})



router.get('/cossign', function(req, res) {
    res.send(encodeURIComponent(utils.generateAppSign()))
})

router.get('/cossign/:path', function(req, res) {
    res.send(encodeURIComponent(utils.generateAppSign(true, req.params.path)))
})
router.get('/useravatarchange/:uri', function(req, res) {
    db.users.findOne({
        _id: req.session.userid
    }, function(err, user) {
        user.avataruri = req.params.uri;
        user.save(function(err) {
            res.send('ok')
        })
    })
})

function getTag(obj) {
    return function(cb) {
        db.tags.findOne(obj, cb);
    }
}

router.post('/editpost/:mode/:id', function(req, res) {
    var postmode = req.params.mode; //根据路由参数决定是draft模式还是submit模式
    var editmode = (req.params.id != 'new'); //根据传入的id决定是新添文档还是编辑旧文档
    var info = req.body;
    var fill = co.wrap(function*(post) {
        if (postmode == 'submit') {
            if (!info.title || !info.excerpt || !info.content || !info.headerpic) {
                return res.send('bad');
            }
        }
        post.title = info.title;
        post.excerpt = info.excerpt;
        post.headerpic = info.headerpic;
        post.content = info.content;
        var arrayedtags = []

        for (var i = 0; i < info.tags.length; i++) {

            var targettag = yield getTag({
                name: info.tags[i]
            });
            if (targettag == null) {
                targettag = {
                    name: info.tags[i],
                    slug: ""
                }
            }
            arrayedtags.push(targettag)

        }
        post.tags = arrayedtags;
        return yield Promise.resolve(true);
    })
    if (editmode) { //如果是编辑模式
        db.posts.findOne({ //找到那个文档
            _id: req.params.id
        }, function(err, post) { //修改他
            co(function*() {
                yield fill(post);
                if (postmode == 'submit') {
                    post.status.type = 'revision';
                } else if (postmode == 'draft') {
                    post.status.type = 'draft'
                } //根据postmode设置文档为审核/草稿
                post.save(function(err) { //保存他
                    if (post.status.type == 'revision') {
                        utils.pushLogs('有文章提交了审核' + post.title, 'user');
                    }
                    res.send({
                        status: 'ok'
                    });
                })
            })
        })
    } else { //如果不是编辑模式，那就是新增
        co(function*() {
            var post = new db.posts; //新建一个文档
            post.author = req.session.userid; //填充
            yield fill(post);
            if (postmode == 'draft') {
                post.status.type = 'draft';
            } else if (postmode == 'submit') {
                post.status.type = 'revision';
            } else {
                return res.send('bad')
            }
            post.save(function(err) {
                if (post.status.type == 'revision') {
                    utils.pushLogs('有文章提交了审核' + post.title, 'user');
                }
                res.send({
                    status: 'ok',
                    newid: post._id
                })
            })
        })
    }

})

router.get('/postsource/:id', function(req, res) {
    db.posts.findOne({
        _id: req.params.id
    }, function(err, post) {
        if (!post) {
            return res.send('reject')
        }
        if (post.author != req.session.userid) {
            res.send('authornotmatch')
        } else {
            var data = {
                author: post.author,
                title: post.title,
                excerpt: post.excerpt,
                headerpic: post.headerpic,
                content: post.content,
                tags: post.tags
            }
            res.send(data)
        }
    })
})

router.get('/getuserposts', function(req, res) {
  var info = {
      final: false,
      posts: []
  }
    db.posts.find({
            author: req.session.userid,
            "status.type": {
                $nin: 'deleted'
            }
        }).sort({
            date: -1
        }).limit(utils.loaderControl.blocksasync)
        .map(function(x) {
            return {
                title: x.title,
                headerpic: x.headerpic,
                dispheaderpic: x.dispheaderpic,
                dispdate: x.dispdate,
                status: x.status,
                id: x._id
            }
        }).exec(function(err, docs) {
          info.posts = docs;
          if(docs.length<utils.loaderControl.blocksasync){
            info.final = true;
          }
            res.send(info)
        })
})

router.get('/getuserposts/:skip', function(req, res) {
    var info = {
        final: false,
        posts: []
    }
    db.posts.find({
            author: req.session.userid,
            "status.type": {
                $nin: 'deleted'
            }
        }).sort({
            date: -1
        })
        .skip(Number(req.params.skip))
        .limit(utils.loaderControl.blocksasync)
        .map(function(x) {
            return {
                title: x.title,
                headerpic: x.headerpic,
                dispheaderpic: x.dispheaderpic,
                dispdate: x.dispdate,
                status: x.status,
                id: x._id
            }
        }).exec(function(err, docs) {
            info.posts = docs;
            db.posts.count({
                author: req.session.userid,
                "status.type": {
                    $nin: 'deleted'
                }
            }, function(err, count) {
                if ((Number(req.params.skip) + utils.loaderControl.blocksasync) >= count) {
                    info.final = true;
                }
                res.send(info)

            })
        })
})

router.get('/userdroppost/:id', function(req, res) {
    db.posts.findOne({
        _id: req.params.id
    }, function(err, post) {
        if (post.author == req.session.userid) {
            if (!post.content) {
                post.remove(function() {
                    res.send('ok')
                });
            } else {
                post.status.type = 'deleted';
                post.save(function(err) {
                    utils.pushLogs('用户：' + req.session.userid + '删除了文章：' + post.title, 'user');
                    res.send('ok')
                })
            }
        } else {
            res.send('bad')
        }
    })
})

router.get('/taglist', function(req, res) {
    db.tags.find({}).map(function(x) {
        return x.name
    }).exec(function(err, docs) {
        res.send(docs)
    })
})


// logout
router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            return res.send('bad')
        }
        res.send('logout');
    })
})

module.exports = router;
