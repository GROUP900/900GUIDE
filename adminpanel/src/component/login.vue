<template>
<div>
  <main id="loginbox">
    <div class="logo"></div>
    <form id="login" autocomplete="off">
      <div><label for="username">用户名</label><input v-on:keyup.enter="submit" v-model="username" name="username" type="text"></div>
      <div><label for="password">密码</label><input v-on:keyup.enter="submit" v-model="password" autocomplete="new-password" name="password" type="password"></div>
      <button v-on:click="submit" type="button">登录</button>
    </form>
  </main>
</div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    submit: function() {
      this.ajax.post(this.apiUrl + 'su/login', {
        username: this.username,
        password: this.password
      }).then((res) => {
        switch (res.data) {
          case "user":
            this.bus.$emit('popMessageComing', 'loginUser');
            break;
          case "pw":
            this.bus.$emit('popMessageComing', 'loginPw');
            break;
          case 'ok':
            this.bus.$emit('popMessageComing', 'loginSuccess');
            setTimeout(() => this.$router.push({name:'dashboard'}), 1000);
            break;
        }

      })
    }
  },
  created: function() {
    this.ajax.post(this.apiUrl + 'su/login',{}).then((res) =>{
      if (res.data == 'already') {
        this.bus.$emit('popMessageComing', 'loginAlready');
        setTimeout(()=>this.$router.push({name:'dashboard'}), 500);
      }
    })
  }

}
</script>
