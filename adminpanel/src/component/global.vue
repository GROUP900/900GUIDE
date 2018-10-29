<template>
<div class="panels">
  <h3>全局设置</h3>

  <div class="bannerinput">
    <p>Banner上传器</p>
    <form ref="bannerform">
      <input type="file" @change="uploadBanner($event)"></input>
      <span v-if='banneruri'>{{banneruri}}</span><span v-else>还没上传</span>
    </form>
  </div>

  <div class="settings">
    <div class="setting">
      <label for="banner-id">BannerID</label> <input type="text" id="banner-id" v-model="bannerID">
    </div>
    <div class="setting">
      <label for="banner-url">BannerUrl</label> <input type="text" id="banner-url" v-model="bannerUrl">
    </div>
    <div class="setting">
      <label for="banner-intro">Banner描述</label> <input type="text" id="banner-intro" v-model="bannerIntro">
    </div>
    <div class="setting">
      <label for="banner-title">Banner标题</label> <input type="text" id="banner-title" v-model="bannerTitle">
    </div>
    <a href="#" @click="updateBanner">确认</a>
  </div>

  <div class="settings">
    <div class="setting">
      <label for="oldpassword">输入旧密码</label> <input type="password" id="oldpassword" v-model="oldPassword">
    </div>
    <div class="setting">
      <label for="newpassword">输入新密码</label> <input type="password" id="newpassword" v-model="newPassword">
    </div>
    <div class="setting">
      <label for="reapeatpassword">repeat</label> <input type="password" id="reapeatpassword" v-model="reapeatPassword">
    </div>
    <a href="#" @click='updatePw'>确认</a>
  </div>

</div>
</div>
</template>

<script>
var cos = require("../scripts/cosinit.js");
export default {
  name: 'global',
  data() {
    return {
      bannerUrl: '',
      bannerID: '',
      bannerIntro: '',
      bannerTitle: '',
      oldPassword: '',
      reapeatPassword: '',
      newPassword: '',
      banneruri: '',
    }
  },
  created: function() {
    this.ajax(this.apiUrl + 'su/settings/banner/get').then((res) => {
      var banner = res.data[0],
        asynccount = res.data[1];
      this.bannerUrl = banner.url;
      this.bannerID = banner.id;
      this.bannerIntro = banner.intro;
      this.bannerTitle = banner.title;
    })
    cos.getAppSign = (cb) => {
      this.ajax(this.apiUrl + 'su/cossign').then((res) => {
        cb(res.data)
      })
    };
  },
  methods: {
    uploadBanner: function(ev) {
      var file = ev.target.files[0];
      cos.uploadFile(
        (cb) => {
          this.banneruri = file.name;
          this.$refs.bannerform.reset();
        },
        () => {
          alert('上传失败了')
        },
        (cb) => {

        },
        '900bucket',
        '/banner/' + file.name, file, 1);
    },
    updateBanner: function() {
      var info = {
        id: this.bannerID,
        url: this.bannerUrl,
        title: this.bannerTitle,
        intro: this.bannerIntro
      };
      this.ajax.post(this.apiUrl + 'su/settings/banner/set', info).then((res) => {
        if (res.data == 'ok') {
          this.bus.$emit('popMessageComing', 'configSuccess', 'banner');
        }
      })
    },

    updatePw: function() {
      if (this.reapeatPassword != this.newPassword) {
        this.bus.$emit('popMessageComing', 'reapeaterr');
        return;
      }
      var info = {
        new: this.newPassword,
        old: this.oldPassword
      };
      this.ajax.post(this.apiUrl + 'su/settings/pw/set', info).then((res) => {
        if (res.data == 'ok') {
          this.bus.$emit('popMessageComing', 'configSuccess', '密码');
          setTimeout(() => this.$router.push({
            name: 'logout'
          }), 1000);
        } else {
          this.bus.$emit('popMessageComing', 'notmatching');
        }
      })
    }

  }

}
</script>

<style scoped>
h3 {
  margin: 20px 0 0 0!important;
  padding-bottom: 30px
}
</style>
