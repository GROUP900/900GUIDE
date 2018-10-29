var db = require("linvodb3");
var moment = require('moment');
moment.locale('zh-cn');
db.dbPath = '../data';

const bucketurl = 'http://files.nine00.com';
const imageCdnUrl = 'http://img.nine00.com';

var logsSchema = {
    type: {
        type: String,
        default: "unknown"
    },
    time: Date,
    message: {
        type: String,
        default: "unknown"
    }
}
var tagsSchema = {
    name: String,
    slug: {
        type: String,
        index: true,
        unique: true
    }
}
var usersSchema = {
    username: {
        type: String,
        index: true,
        unique: true
    },
    pass: String,
    salt: String,
    email: {
        type: String,
        index: true,
        unique: true
    },
    nickname: {
        type: String,
        index: true,
        unique: true
    },
    avataruri: {
        type: String,
        default: "default_avatar.jpg"
    },
    avatarurl: {
        get: function() {
            return imageCdnUrl + '/useravatar/' + this.avataruri + '/avatar'
        }
    },
    status: {
        type: String,
        default: "active"
    },
    contact: String,
    bm: [String],
    signup:Date
}
var upsSchema = {
    linkto:{
        type: String,
        index: true,
        unique: true
    },
    headerpic:{
        type: String,
        default: "default.jpg"
    },
    headerpicurl: {
        get: function() {
            return imageCdnUrl + '/upbanner/' + this.headerpic
        }
    },
    signature:String,
    wb:String,
    wx:String,
    qq:String,
    email:String,
    wxpublic:String
}

var collectionSchema = {
  list:[String],
  name:String,
  slug:String,
  hp:String,
  hpmobi:String,
  disphp:{
    get: function() {
        return imageCdnUrl + '/collectbanner/' + this.hp
    }
  },
  disphpmobi:{
    get: function() {
        return imageCdnUrl + '/collectbanner/' + this.hpmobi
    }
  }
}

var commentsSchema = {
    linkto: String,
    author: String,
    email: String,
    time: Date,
    disptime: {
        get: function() {
            return moment(this.time).fromNow();
        }
    },
    content: String,
    avatarid: {
        type: String,
        default: "900.jpg"
    },
    avatarUrl: {
        get: function() {
            return bucketurl + '/cmtavatar/' + this.avatarid;
        }
    },
    type: String
}
var postsSchema = {
    title: {
        type: String,
        default: "未命名"
    },
    excerpt: String,
    headerpic: String,
    dispheaderpic: {
        get: function() {
            return imageCdnUrl + '/content/' + this.headerpic + '/headerpic';
        }
    },
    content: String,
    date: Date,
    dispdate: {
        get: function() {
            return moment(this.date).format('lll');
        }
    },
    timestamp:{
        get: function() {
            return Number(Date.parse(this.date))
        }
    },
    author: String,
    status: {
        type: {
            type: String,
            default: "draft"
        },
        message: String
    },
    type: {
        type: String,
        default: "post"
    },
    resource:String,
    tags: []
}

var logs = new db('logs', logsSchema, {});
var settings = new db('global');
var tags = new db('tags', tagsSchema, {});
var users = new db('users', usersSchema, {});
var upsetting = new db('upsetting', upsSchema, {});
var comments = new db('comments', commentsSchema, {});
var posts = new db('posts', postsSchema, {});
var collect = new db('collect',collectionSchema,{});

module.exports.bucketurl = bucketurl;
module.exports.db = db
module.exports.logs = logs
module.exports.tags = tags
module.exports.users = users
module.exports.settings = settings
module.exports.posts = posts
module.exports.comments = comments
module.exports.upsetting = upsetting
module.exports.collect = collect
