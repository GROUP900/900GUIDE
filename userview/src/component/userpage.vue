<template>
<div class="userpage" v-if='display' v-title :data-title="nickname+' | 900指南'">
  <form v-if='editmode' ref="headerpicform" style="display:none;"><input @change="uploadpic($event)" id='headerpicinput' type="file" accept="image/png,image/jpeg" /></form>
  <modal></modal>
  <div v-if='editmode&&showmodal' class="modal upset">
    <input placeholder="微信公众号(微信号)" v-model='setting.wxpublic'></input>
    <input placeholder="微信个人账号" v-model='setting.wx'></input>
    <input placeholder="QQ" v-model='setting.qq'></input>
    <input placeholder="微博" v-model='setting.wb'></input>
    <input placeholder="邮箱" v-model='setting.email'></input>
    <span @click='setinfo'>确认修改</span>
  </div>
  <router-link class='back900' :to="{ name: 'index'}"><span></span></router-link>
  <div class="set" v-if='editmode'>
    <p @click='opensetting'><span></span><b>修改显示信息</b></p> <span @click="showinfo('hint')" class="settinginfo"></span></div>
  <div class="upcover" @mouseenter="showcpb('enter')" @mouseleave="showcpb('leave')" :class="{ active: cpb }">
    <div class="wrapper">
      <label for='headerpicinput' v-if='editmode' v-show="cpb" class="changepicbtn">
          <span class="icon"></span>
          <span>点此上传焦点图片，最大4000x1200px</span>
        </label>
      <img :src="headerpic">
    </div>
  </div>
  <div class="nav hidden-mobi">
    <div class="info">
      <img :src="avatar">
      <p>
        <span class="nickname">{{nickname}}</span>
        <span class="signature" v-if='!editmode&&setting.signature'>{{signature}}</span>
        <input v-model.lazy='signature' placeholder='点此编辑签名' v-if='editmode'></input>
      </p>
    </div>
    <div class="btn">
      <span v-if='setting.email' class="email">联系邮箱:{{setting.email}}</span>
      <span @click="showinfo('wx')" v-if='setting.wx&&!setting.wxpublic' class="wx"></span>
      <span @click="showinfo('wxp')" v-if='setting.wxpublic' class="wx"></span>
      <span @click="showinfo('wb')" v-if='setting.wb' class="wb"></span>
      <span @click="showinfo('qq')" v-if='setting.qq' class="qq"></span>
    </div>
  </div>

  <div class="navmobi hidden-dt">

    <img :src="avatar">

    <p class="nickname">{{nickname}}</p>
    <p class="signature" v-if='!editmode&&setting.signature'>{{signature}}</p>
    <input v-model.lazy='signature' placeholder='点此编辑签名' v-if='editmode'></input>
    <p v-if='setting.email' class="email">联系邮箱:{{setting.email}}</p>

    <div class="btn">
      <span @click="showinfo('wx')" v-if='setting.wx&&!setting.wxpublic' class="wx"></span>
      <span @click="showinfo('wxp')" v-if='setting.wxpublic' class="wx"></span>
      <span @click="showinfo('wb')" v-if='setting.wb' class="wb"></span>
      <span @click="showinfo('qq')" v-if='setting.qq' class="qq"></span>
    </div>
  </div>

  <section class="post_list list">
    <div v-for='post in posts' class="post_block">
      <article>
        <div class="aspect-ratio"><router-link :to="{ name: 'post', params: { id: post._id }}"><img :src="post.headerpic"></router-link></div>
        <h3><router-link :to="{ name: 'post', params: { id: post._id }}">{{post.title}}</router-link></h3>
        <p>{{post.excerpt}}</p>
      </article>
    </div>
    <div v-for="n in 6" class="post_offset"></div>
  </section>
  <p @click='loadmore' class="loadmorebtn" v-if='showloadmore'><span>加载更多</span></p>
</div>
</template>

<script>
import modal from './modal.vue';
var cos = require("../scripts/cosinit.js");
export default {
  name: 'userpage',
  data() {
    return {
      setting: {},
      avatar: '',
      nickname: '',
      posts: [],
      editmode: false,
      showmodal: false,
      signature: '',
      init: false,
      cpb: false,
      uploadbusy: false,
      newhp: '',
      display: false,
      page:1,
      showloadmore:true
    }
  },
  computed: {
    headerpic: function() {
      if (this.newhp) {
        return this.imgCdn + '/upbanner/' + this.newhp;
      } else {
        return this.setting.headerpicurl;
      }
    }
  },
  watch: {
    signature: function() {
      if (!this.init) {
        return;
      }
      this.ajax.post(this.apiUrl + 'show/setsignature/', {
        signature: this.signature
      }).then((res) => {
        if (res.data == 'ok') {
          this.bus.$emit('popMessageComing', '签名已保存', 'ok');
        }
      })
    }
  },
  components: {
    'modal': modal
  },
  created: function() {
    this.ajax(this.apiUrl + 'show/userpage/' + this.$route.params.username).then((res) => {
      if (this.reject(res)) {
        return
      }
      var info = res.data;
      this.avatar = info.avatar;
      this.nickname = info.nickname;
      this.posts = info.posts;
      this.setting = info.upsetting;
      this.signature = info.upsetting.signature;
      this.showloadmore = (info.final) ? false:true;
      if (info.editmode) {
        this.editmode = true;
      }
      this.display = true;
      setTimeout(() => {
        this.init = true;
      }, 0)
    })
    this.bus.$on('backdropclosed', () => {
      this.showmodal = false;
    })
    cos.getAppSign = (cb) => {
      this.ajax(this.apiUrl + 'user/cossign').then((res) => {
        cb(res.data)
      })
    };
  },
  methods: {
    loadmore: function() {
      this.ajax(this.apiUrl + 'show/userpage/' + this.$route.params.username+'/' + this.page).then((res) => {
          this.posts = this.posts.concat(res.data.posts);
          this.page++;
          if(res.data.final){
            this.showloadmore = false
          }
      });
    },
    uploadpic: function(ev) {
      var file = ev.target.files[0];
      if (file.size > 5242880) {
        return this.bus.$emit('popMessageComing', '尺寸大于5mb了...裁剪一下再发', 'warn');
      }
      if (file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/gif') {

      } else {
        return this.bus.$emit('popMessageComing', '格式不对', 'warn');
      }
      if (this.uploadbusy) {
        return this.bus.$emit('popMessageComing', '稍等，另一个文件正在上传', 'warn');
        return;
      }
      this.uploadbusy = true;
      var uri = this.$route.params.username + '-' + Date.now();
      cos.uploadFile(
        (cb) => {
          this.ajax.post(this.apiUrl + 'show/setuphp/', {
            uri: uri
          }).then((res) => {
            if (res.data == 'ok') {
              this.newhp = uri;
              this.bus.$emit('popMessageComing', '焦点图片已替换', 'ok');
            }
          })
          this.uploadbusy = false;
          this.$refs.headerpicform.reset();
        },
        () => {
          this.uploadbusy = false;
          this.bus.$emit('popMessageComing', '上传失败了...请重试或联系我们', 'warn');
          this.$refs.headerpicform.reset();
        },
        (cb) => {
          var progress = parseInt(cb * 100)
          this.bus.$emit('popMessageComing', '正在上传:' + progress + "%", 'ok');
        },
        '900bucket',
        '/upbanner/' + uri, file, 1);
    },
    showcpb: function(type) {
      if (!this.editmode) {
        return;
      }
      if (type == 'enter') {
        this.cpb = true;
      } else {
        this.cpb = false;
      }
    },
    showinfo: function(type) {
      switch (type) {
        case 'wxp':
          var test = new Image();
          test.src = "http://open.weixin.qq.com/qr/code/?username=" + this.setting.wxpublic;
          test.onload = () => {
            this.bus.$emit('openmodal', 'qr', "http://open.weixin.qq.com/qr/code/?username=" + this.setting.wxpublic);
          }
          break;
        case 'hint':
          this.bus.$emit('openmodal', 'message', 'upset');
          break;
        case 'qq':
          this.bus.$emit('openmodal', 'simple', this.setting.qq);
          break;
        case 'wx':
          this.bus.$emit('openmodal', 'simple', this.setting.wx);
          break;
        case 'wb':
          this.bus.$emit('openmodal', 'simple', this.setting.wb);
          break;
      }
    },
    opensetting: function() {
      this.bus.$emit('openbackdrop');
      this.showmodal = true;
    },
    setinfo: function() {
      this.ajax.post(this.apiUrl + 'show/setuserpage/', this.setting).then((res) => {
        if (res.data == 'ok') {
          this.bus.$emit('popMessageComing', '显示信息已保存', 'ok');
          this.bus.$emit('closebackdrop');
        }
      })
    }
  }
}
</script>
