<template>
<transition name="leftboard">
  <nav v-if="show" id="menu">
    <div id="menutop">
      <div class="control" @click="closeleftBoard">
        <span class="close"></span>
      </div>
      <div id="searchform">
        <input type="text" v-model='keyword' v-on:keyup.enter="search" placeholder="Search"></input>
      </div>
      <div v-if="login" class="userwidget">
        <div><router-link :to="{ name: 'userposts'}"><img :src="avatar"></router-link></div>
        <ul>
          <li class="star"><router-link :to="{ name: 'bm'}"><img src="../assets/svg/staru_w.svg"></router-link></li>
          <li class="posts"><router-link :to="{ name: 'userposts'}"><img src="../assets/svg/archive_w.svg"></router-link></li>
          <li class="setting"><router-link :to="{ name: 'settings'}"><img src="../assets/svg/set_w.svg"></router-link></li>
          <li class="logout" @click="logout"><router-link :to="{ name: 'logout'}">注销</router-link></li>
        </ul>
      </div>
      <ul id="menulist">
        <li v-if="!login"><router-link :to="{ name: 'signin'}">登录</router-link>/<router-link :to="{ name: 'signup'}">注册</router-link></li>
        <li>出品
          <p><router-link :to="{ name: 'collection',params:{slug:'broadcast'}}">播客</router-link> / <router-link :to="{ name: 'collection',params:{slug:'video'}}">短片</router-link></p>
        </li>
        <li>找到我们
          <p>微信公众号:900指南</p>
          <img class='qr' src='http://open.weixin.qq.com/qr/code/?username=nine00guide'>
        </li>
      </ul>
    </div>
    <div id="menubottom">
      <p>
        <a href="mailto:witcat@nine00.com">联系</a><br>京ICP备15047530号-2<br>&copy; 2017 project ds. All rights reserved.
      </p>
    </div>
  </nav>
</transition>
</template>

<script>
export default {
  name: 'leftBoard',
  data() {
    return {
      login:false,
      show: false,
      init:false,
      avatar:'',
      keyword:''
    }
  },
  methods: {
    search:function(){
      if(!this.keyword){
        this.$router.push({ name: 'list', params: { type: 'post',param:'default',page:'1' }})
      }else{
        this.$router.push({ name: 'list', params: { type: 'search',param:this.keyword,page:'1' }})
      }
      this.closeleftBoard();
    },
    logout:function(){
      this.login=false;
      this.closeleftBoard()
    },
    closeleftBoard: function() {
      this.show = false;
      this.bus.$emit('closebackdrop')
    }
  },
  created: function() {
    this.bus.$on('openleftBoard', () => {
      if(!this.init){
        this.ajax(this.apiUrl + 'show/sidebarstatus/').then((res) => {
          if(res.data.status =='ok'){
            this.login = true;
            this.avatar = res.data.avatar;
          }
          this.init=true;
        })
      }
      this.show = true;
    })
    this.bus.$on('backdropclosed', () => {
      this.show = false;
    })
  }
}
</script>
