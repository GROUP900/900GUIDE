<template>
<div class="panels">
  <h3>用户管理</h3>
  <div class="hr"></div>
  <ul class="itemlist">
    <useritem v-on:changed="reload" v-for="user in userinfo" :nickname='user.nick' :status='user.status' :id='user.id' :email='user.email' :username='user.username' :key="user.id"></useritem>
  </ul>
</div>
</template>

<script>
import useritem from './useritem.vue'
export default {
  name: 'users',
  data() {
    return {
      userinfo:null
    }
  },
  components: {
    'useritem' : useritem
  },
  created: function() {
    this.ajax(this.apiUrl + 'su/users/get/').then((res) => {
      this.userinfo = res.data
    })
  },
  methods: {
    reload:function(){
      this.ajax(this.apiUrl + 'su/users/get/').then((res) => {
        this.userinfo = res.data
      })
    }
  }


}
</script>
