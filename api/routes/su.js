var express = require('express');
var router = express.Router();
var db = require('../models/db.js'); //Linvodb3 & schema
var session = require('express-session'); //cookie session
var utils = require('../lib/utils.js');
var md5 = require('md5');
var randomString = require('crypto-random-string');
var moment = require('moment');
var co = require('co');

moment.locale('zh-cn');

router.use(utils.backSession);
router.post('/login', function(req, res) {
    if (req.session.suLoggin) {
        res.send('already');
        return;
    }
    db.settings.findOne({
        '_id': 'su'
    }, function(err, doc) {
        if (req.body.username != doc.username) {
            res.send('user');
            return;
        }
        if (md5(req.body.password + doc.salt) != doc.pw) {
            res.send('pw')
            return;
        }
        req.session.suLoggin = true;
        utils.pushLogs('超管登陆了', 'su-panel');
        res.send('ok');
    })

});

router.use(function(req, res, next) {
    if (req.session.suLoggin) {
        next();
    } else {
        res.send('session lost')
    }
});
// session judge middleware
router.get('/loginstatus', function(req, res) {
    res.send('letgo')
})

// logout
router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            return;
        }
        res.send('logout');
    })
})
//read dashboard logs
router.get('/logs/:page', function(req, res) {
    var skip = req.params.page * 50;
    db.logs.find({}).sort({
        time: -1
    }).skip(skip).limit(50).exec(function(err, docs) {
        res.json(docs);
    });
    db.logs.count({}, function(err, count) {
        if (count > 300) {
            db.logs.find({}).sort({
                time: -1
            }).skip(300).limit(1000).exec(function(err, logs) {
                for (var i = 0; i < logs.length; i++) {
                    logs[i].remove()
                }
            })
        }
    })
})

//read users
router.get('/users/get', function(req, res) {
    db.users.find({}, function(err, docs) {
        resdocs = [];
        for (var i = 0; i < docs.length; i++) {
            var doc = {
                username: docs[i].username,
                id: docs[i]._id,
                email: docs[i].email,
                nick: docs[i].nickname,
                status: docs[i].status
            }
            resdocs.push(doc)
        }
        res.send(resdocs)
    })
})

router.post('/users/set', function(req, res) {
    db.users.findOne({
        '_id': req.body.id
    }, function(err, doc) {
        if (req.body.type == 'ban') {
            doc.status = 'banned';
        } else if (req.body.type == 'unban') {
            doc.status = 'active'
        } else if (req.body.type == 'delete') {
            db.posts.remove({
                author: doc._id
            }, {
                multi: true
            }, function(err, numRemoved) {
                doc.remove(function() {
                    res.send('ok');
                })
            });
            return;
        }
        doc.save(function() {
            res.send('ok')
        })
    })
})
//read tags
router.get('/tags/get', function(req, res) {
    db.tags.find({}, function(err, docs) {
        res.send(docs)
    })
})

router.post('/tags/set', function(req, res) {
    var info = req.body;
    switch (info.type) {
        case 'delete':
            db.tags.remove({
                '_id': info.id
            }, {}, function(err, doc) {
                res.send('ok');
            });
            break;
        case "add":
            var doc = new db.tags();
            doc.name = info.name;
            doc.slug = info.slug;
            doc.save(function() {
                res.send('ok')
            })
            break;
        case "set":
            db.tags.findOne({
                '_id': info.id
            }, function(err, doc) {
                doc.name = info.name;
                doc.slug = info.slug;
                doc.save(function() {
                    res.send('ok');
                });
            });
            break;
        default:
            res.send('wrong type');
    }
})
//settings
router.get('/settings/banner/get', function(req, res) {
    db.settings.find({
        '_id': {
            $nin: ['su']
        }
    }, function(err, docs) {
        res.send(docs)
    })
})

router.post('/settings/banner/set', function(req, res) {
    db.settings.findOne({
        '_id': 'banner'
    }, function(err, doc) {
        doc.intro = req.body.intro;
        doc.title = req.body.title;
        doc.url = req.body.url;
        doc.id = req.body.id;
        doc.save(function(err) {
            res.send('ok')
        })
    })
})

router.post('/settings/comment/set', function(req, res) {
    db.settings.findOne({
        '_id': 'loadercontrol'
    }, function(err, doc) {
        doc.commentasync = req.body.commentasync;
        doc.save(function(err) {
            res.send('ok')
        })
    })
})

router.post('/settings/list/set', function(req, res) {
    db.settings.findOne({
        '_id': 'loadercontrol'
    }, function(err, doc) {
        doc.blocksasync = req.body.blocksasync;
        doc.blocksonpage = req.body.blocksonpage;
        doc.save(function(err) {
            res.send('ok')
        })
    })
})

router.post('/settings/pw/set', function(req, res) {
    db.settings.findOne({
        '_id': 'su'
    }, function(err, doc) {
        if (md5(req.body.old + doc.salt) != doc.pw) {
            return res.send('bad')
        } else {
            doc.salt = randomString(15);
            doc.pw = md5(req.body.new + doc.salt);
            doc.save(function(err) {
                res.send('ok');
            })
        }
    })
})

//getpostthismonth
router.get('/posts/get/:date', function(req, res) {
    var startofmonth = moment(req.params.date, 'x').startOf('month');
    var endofmonth = moment(req.params.date, 'x').endOf('month');
    db.posts.find({
            "status.type": {
                $nin: 'draft'
            }
        })
        .filter(function(x) {
            return (x.timestamp > startofmonth && x.timestamp < endofmonth)
        })
        .sort({
            date: -1
        })
        .map(function(x) {
            return {
                title: x.title,
                status: x.status,
                id: x._id
            }
        }).exec(function(err, docs) {
            res.send(docs)
        })
})

router.get('/post/get/:id', function(req, res) {
    db.posts.findOne({
        _id: req.params.id
    }, function(err, post) {
        res.send(post)
    })
})

//1step modi post
router.post('/posts/set', function(req, res) {
    db.posts.findOne({
        _id: req.body.id
    }, function(err, post) {
        switch (req.body.type) {
            case 'reject':
                post.status.type = 'reject';
                if (!req.body.message) {
                    post.status.message = '自动'
                } else {
                    post.status.message = req.body.message;
                }
                break;
            case 'adopt':
                post.status.type = 'showing';
                post.status.message = '';
                break;
            case 'crush':
                post.remove(function() {
                    res.send('ok')
                })
                return;
            case 'delete':
                post.status.type = 'deleted';
                break;
        }
        post.save(function(err) {
            res.send('ok')
        })
    })

})

function getTag(obj) {
    return function(cb) {
        db.tags.findOne(obj, cb);
    }
}

router.post('/posts/set/:id', function(req, res) {

    var info = req.body;
    db.posts.findOne({
        _id: req.params.id
    }, function(err, post) {
        co(function*() {
            post.title = info.title;
            post.excerpt = info.excerpt;
            post.content = info.content;
            post.headerpic = info.headerpic;
            post.type = info.type;
            post.resource = info.resource;

            if (info.externaldate) {
                post.date = moment(info.externaldate).toDate();
            }
            var arrayedtags = [];
            for (var i = 0; i < info.tagString.length; i++) {
                var targettag = yield getTag({
                    name: info.tagString[i]
                });
                if (targettag == null) {
                    return res.send('tagnotfound');
                } else {
                    arrayedtags.push(targettag);
                }
            }
            post.tags = arrayedtags;
            post.status.type = 'showing';
            post.save(function(err) {
                res.send('ok')
            })
        })
    })
})

function getpost(obj) {
    return function(cb) {
        db.posts.findOne(obj, cb);
    }
}

router.get('/comments/get/:date', function(req, res) {
    var startofmonth = moment(req.params.date, 'x').startOf('month');
    var endofmonth = moment(req.params.date, 'x').endOf('month');
    db.comments.find({}).sort({
            time: -1
        })
        .filter(function(x) {
            var timestamp = Number(Date.parse(x.time));
            return (timestamp > startofmonth && timestamp < endofmonth)
        })
        .exec(function(err, docs) {
            co(function*() {
                for (var i = 0; i < docs.length; i++) {
                    var linkedpost = yield getpost({
                        _id: docs[i].linkto
                    });
                    if (linkedpost != null) {
                        docs[i].linkedpost = linkedpost.title
                    }
                }
                res.send(docs)
            })
        })
})


router.get('/comments/drop/:id', function(req, res) {
    db.comments.remove({
        _id: req.params.id
    }, function() {
        res.send('ok')
    })
})

router.get('/count', function(req, res) {
    var now = Number(new Date());
    var weekago = now - 604800000;
    var weekcount = {};
    var totalcount = {};
    db.posts.find({}).sort({
        date: -1
    }).filter(function(x) {
        return (x.timestamp > weekago && x.timestamp < now)
    }).count(function(err, count) {
        weekcount.posts = count;
        db.comments.find({}).sort({
            time: -1
        }).filter(function(x) {
            var timestamp = Number(Date.parse(x.time))
            return (timestamp > weekago && timestamp < now)
        }).count(function(err, count) {
            weekcount.comments = count
            db.users.find({}).sort({
                signup: -1
            }).filter(function(x) {
                var timestamp = Number(Date.parse(x.signup))
                return (timestamp > weekago && timestamp < now)
            }).count(function(err, count) {
                weekcount.contributer = count
                db.posts.count({}, function(err, count) {
                    totalcount.posts = count;
                    db.comments.count({}, function(err, count) {
                        totalcount.comments = count;
                        db.users.count({}, function(err, count) {
                            totalcount.users = count;
                            db.tags.count({}, function(err, count) {
                                totalcount.tags = count;
                                res.send({
                                    week: weekcount,
                                    total: totalcount
                                })
                            })
                        })
                    })
                })
            })
        })
    });
})

router.get('/collects/get', function(req, res) {
    db.collect.find({})
        .map(function(x) {
            return {
                slug: x.slug,
                name: x.name
            }
        }).exec(function(err, docs) {
            res.send(docs);
        })
})

router.get('/collect/get/:slug', function(req, res) {
    db.collect.findOne({
        slug: req.params.slug
    }, function(err, doc) {
        res.send(doc)
    })
})
router.post('/collect/set/:slug', function(req, res) {
    var info = req.body;
    db.collect.findOne({
        slug: req.params.slug
    }, function(err, doc) {
        doc.name = info.name;
        doc.slug = info.slug;
        doc.list = info.list;
        doc.hp = info.hp;
        doc.hpmobi = info.hpmobi;
        doc.save(function(err) {
            res.send('ok')
        })
    })
})

router.post('/collect/add', function(req, res) {
    var info = req.body;
    var doc = new db.collect;
    doc.name = info.name;
    doc.slug = info.slug;
    doc.list = info.list;
    doc.hp = info.hp;
    doc.hpmobi = info.hpmobi;
    doc.save(function(err) {
        res.send('ok')
    })

})

router.get('/collects/drop/:slug', function(req, res) {
    db.collect.remove({
        slug: req.params.slug
    },{} ,function(err,numRemoved) {
        res.send('ok')
    })
})

router.get('/cossign', function(req, res) {
    res.send(encodeURIComponent(utils.generateAppSign()))
})

module.exports = router;
