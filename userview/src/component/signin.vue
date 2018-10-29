<template>
<div>

  <img class="avatar" :src="avatarurl">
  <div v-if="!retrivepw">
    <input v-if='stepOne' ref="mailinput" v-on:keyup.enter="checkEmail" v-model="email" class="center" placeholder="邮箱">
    <input v-if='!stepOne' ref="pwinput" v-on:keyup.enter="submit" type="password" v-model="password" class="center" placeholder="密码">
    <div v-if='stepOne' class="submit" @click='checkEmail'>下一步</div>
    <div v-if='!stepOne' class="submit" @click='submit'>登录</div>
    <p class="nav"><span v-if='stepOne'><router-link :to="{ name: 'signup'}">创建新账号</router-link></span>
      <span v-if='!stepOne' @click="switchstep(true)">◀ 切换账号</span><span @click="remember = !remember" :class="{ gray: !remember}" v-if='!stepOne'>{{remembertext}}</span><span @click="retrivePw" v-if='!stepOne'>忘记密码</span></p>
  </div>
  <div v-if="retrivepw">
    <p class="title">找回密码</p>
    <p class="intro" v-if='RstepOne'>不要关闭这个页面，一条<b>随机代码已经发送到你的邮箱</b><br><b>{{email}}</b><br>10分钟内填写正确的代码以重置密码<br>未收到请刷新</p>
    <input class="center" v-if='RstepOne' v-model='secret' placeholder="代码">
    <div class="submit" v-if='RstepOne' @click='testSecret'>确认</div>
    <input class="center" v-if='!RstepOne' type="password" v-model='newpw' placeholder="新密码">
    <input class="center" v-if='!RstepOne' type="password" v-model='retypenewpw' placeholder="重复新密码">
    <div class="submit" v-if='!RstepOne' @click='changePw'>修改密码</div>
    <p class="nav" v-if='RstepOne'><span @click="retrivepw=!retrivepw">◀ 登录</span></p>
  </div>
</div>
</template>

<script>
export default {
  name: 'signin',
  data() {
    return {
      retrivepw: false,
      stepOne: true,
      avatarurl: this.imgCdn + '/useravatar/default_avatar.jpg',
      email: '',
      password: '',
      secret: '',
      RstepOne: true,
      newpw: '',
      retypenewpw: '',
      remember:false
    }
  },
  computed:{
    remembertext:function(){
      if(!this.remember){return '不保持登录'}else{return '一周内保持'}
    }
  },
  created: function() {
    if (window.localStorage.account) {
      this.email = window.localStorage.account;
      this.ajax.post(this.apiUrl + 'user/getavatarviamail',{email:this.email}).then((res) => {
        this.avatarurl = res.data;
      })
      this.stepOne = false;
      setTimeout(() => {
        this.$refs.pwinput.focus()
      }, 0)
    } else {
      setTimeout(() => {
      this.$refs.mailinput.focus()
      }, 0)
    }
  },
  methods: {
    switchstep: function(empty) {
      if (empty) {
        this.avatarurl = this.imgCdn + '/useravatar/default_avatar.jpg';
        this.email = '';
        window.localStorage.removeItem('account');
        setTimeout(() => {
          this.$refs.mailinput.focus()
        }, 0)
      } else {
        setTimeout(() => {
          this.$refs.pwinput.focus()
        }, 0)
      }
      this.stepOne = !this.stepOne;
      this.stepTwo = !this.stepTwo;
    },
    checkEmail: function() {
      if (!this.email) {
        return this.bus.$emit('popMessageComing', '填好了再点', 'warn');
      }
      var message = {
        step: 1,
        email: this.email
      }
      this.ajax.post(this.apiUrl + 'user/signin', message).then((res) => {
        if (res.data == 'bad') {
          return this.bus.$emit('popMessageComing', '不存在的邮箱', 'warn');
        }
        this.avatarurl = res.data;
        this.switchstep();
      })
    },
    submit: function() {
      var message = {
        step: 2,
        email: this.email,
        password: this.password,
        remember:this.remember
      }
      this.ajax.post(this.apiUrl + 'user/signin', message).then((res) => {
        if (res.data == 'bad') {
          return this.bus.$emit('popMessageComing', '密码不对', 'warn');
        }
        if (res.data == 'banned') {
          return this.bus.$emit('popMessageComing', 'oh..被临时封禁了，请联系管理员', 'warn');
        }
        window.localStorage.account = this.email;
        this.bus.$emit('popMessageComing', '登录成功', 'ok');
        this.$router.replace({
          name: 'userposts'
        })
      })
    },
    retrivePw: function() {
      this.retrivepw = true;
      this.ajax.post(this.apiUrl + 'user/retrivepw', {
        step: 1,
        email: this.email
      }).then((res) => {
        if (res.data == 'error') {
          return this.bus.$emit('popMessageComing', '服务出错，请通知我们', 'warn');
        }
        this.bus.$emit('popMessageComing', '邮件已发送', 'ok');
      })
    },
    testSecret: function() {
      this.ajax.post(this.apiUrl + 'user/retrivepw', {
        step: 2,
        secret: this.secret
      }).then((res) => {
        switch (res.data) {
          case 'ok':
            this.bus.$emit('popMessageComing', '请设置新密码', 'ok');
            this.RstepOne = !this.RstepOne;
            break;
          case 'bad':
            this.bus.$emit('popMessageComing', '不匹配', 'warn');
            break;
          case 'timeout':
            this.retrivepw = !this.retrivepw;
            this.bus.$emit('popMessageComing', '超时了...动作再快点', 'warn');
            break;
        }

      })
    },
    changePw: function() {
      if (this.newpw.length < 8) {
        return this.bus.$emit('popMessageComing', '密码太短了(8位以上)', 'warn');
      }
      if (this.newpw != this.retypenewpw) {
        return this.bus.$emit('popMessageComing', '两次密码不匹配', 'warn');
      }
      this.ajax.post(this.apiUrl + 'user/retrivepw', {
        step: 3,
        password: this.newpw,
        secret: this.secret
      }).then((res) => {
        if(res.data == 'ok'){
          this.bus.$emit('popMessageComing', '密码已设置，请重新登录', 'ok');
          this.retrivepw = !this.retrivepw;
          this.RstepOne = !this.RstepOne;
          this.retypenewpw = '';
          this.newpw = '';
          this.secret = '';
        }
      })
    }
  }
}
</script>
