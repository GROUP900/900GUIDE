<template>
<div>
  <p class="title">创建900指南账号</p>
  <p class="intro">收藏喜欢的内容，自定义你的显示信息<br>同时在这里分享你的爱好！</p>

  <input v-model="email" type="email" placeholder="邮箱">
  <input v-model="username" maxlength="15" placeholder="用户名(英文/数字)">
  <input v-model="nickname" maxlength="8" placeholder="昵称">
  <input v-model="password" type="password" placeholder="密码">
  <input v-model="retype" type="password" placeholder="重复密码">
  <div class="submit" @click="submit">创建账号</div>
  <p class="nav"><span><router-link :to="{ name: 'signin'}">我有账号，去登陆</router-link></span></p>
</div>
</template>

<script>
export default {
  name: 'signup',
  data() {
    return {
      email: '',
      username: '',
      nickname: '',
      password: '',
      retype: '',
      busy: false
    }
  },
  computed: {
    emptyinput: function() {
      if (!this.email || !this.username || !this.nickname || !this.password || !this.retype) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    validate: function() {
      if (this.emptyinput) {
        return this.bus.$emit('popMessageComing', '所有项目都是必填项', 'warn');
      }
      if (this.password.length < 8) {
        return this.bus.$emit('popMessageComing', '密码太短了(8位以上)', 'warn');
      }
      if (this.password != this.retype) {
        return this.bus.$emit('popMessageComing', '两次输入的密码不匹配', 'warn');
      }
      var mailp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var usernamep = /[a-zA-Z0-9]/;
      if (!mailp.test(this.email)) {
        return this.bus.$emit('popMessageComing', '邮箱格式不对（填写错误的邮箱，你将无法找回密码）', 'warn');
      }
      if (!usernamep.test(this.username)) {
        return this.bus.$emit('popMessageComing', '用户名只能为数字和字母', 'warn');
      }
      return 'pass';
    },
    submit: function() {
      if (this.busy) {
        return;
      }
      this.busy = true;
      if (this.validate() !== 'pass') {
        this.busy = false
        return;
      }
      var message = {
        email: this.email,
        username: this.username,
        nickname: this.nickname,
        password: this.password
      }
      this.ajax.post(this.apiUrl + 'user/signup', message).then((res) => {
        switch (res.data) {
          case "ok":
            this.bus.$emit('popMessageComing', '已创建，马上去登录~', 'ok');
            this.busy = true;
            window.localStorage.removeItem('account');
            setTimeout(() => this.$router.push({
              name: 'signin'
            }), 500);
            return;
            break;
          case "email":
            this.bus.$emit('popMessageComing', '已存在的邮箱，请直接登录', 'warn');
            break;
          case "username":
            this.bus.$emit('popMessageComing', '用户名已存在', 'warn');
            break;
          case "nickname":
            this.bus.$emit('popMessageComing', '昵称已存在', 'warn');
            break;
          case "reject":
            this.bus.$emit('popMessageComing', '你被拒绝了 :P', 'warn');
            break;
        }
      })
      this.busy = false;
    }
  }
}
</script>
