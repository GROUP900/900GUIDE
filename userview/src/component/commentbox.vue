<template>
<div class="commentbox">
  <div class="setting" v-if="openSetting">
    <p @click="guide=!guide">说明<span v-show="guide"> 900的评论是前台匿名后台实名的，请注意文明。选择头像补充信息后，浏览器会保存你的信息，如需自定义头像，请注册账号。</span></p>
    <div v-once class="avatars" @click="selectAvatar($event);">
      <img v-for="avatar in avatarList" :data-avatar="avatar+'.jpg'" :src="imgCdn+'/cmtavatar/'+avatar+'.jpg'"></img>
    </div>
    <div class="userinfo"><input v-model="username" placeholder="输入名字"></input><input v-model="useremail" placeholder="输入邮箱"></input><span @click="confirmSetting">保存</span></div>
  </div>
  <div class="avatar" @click="openInfo">
    <img :src="avatarUrl"></img>
  </div>
  <input v-on:keyup.enter="sendCmt" v-model="content" :disabled="!access" :placeholder="hint"></input>
</div>
</template>

<script>
//头像url的分歧，登录头像和用户头像存在两个文件夹，所以首先评论框显示的头像应改为一个计算属性
//先不管怎样读取，我们可以在后台schema中设置getter统一输出url
export default {
  name: 'commentbox',
  data() {
    return {
      status: "",
      hint: "",
      guide: false,
      avatarList: ['alex', 'awesome', 'doge', 'jeff', 'maite', 'meat', 'mm', 'vw', 'morning', 'pedo', 'pedo_full', 'uncledeath', 'yamishibai', '900', 'ds'],
      selectedAvatar: null,
      username: "",
      useremail: "",
      currentAvatar: '900.jpg',
      openSetting: false,
      content: ''
    }
  },
  computed: {
    access: function() {
      if (this.status == "ok") {
        return true;
      } else {
        return false;
      }
    },
    avatarUrl:function(){
      if(!this.loginuser){
        return this.imgCdn+'/cmtavatar/'+ this.currentAvatar;
      }else{
        return this.imgCdn+'/useravatar/'+ this.currentAvatar+'/avatar';
      }
    }
  },
  methods: {
    confirmSetting: function() {
      if (this.selectedAvatar == null || !this.username || !this.useremail) {
        this.bus.$emit('popMessageComing', '需要全部填好才能保存。', 'warn');
        return;
      }
      var storage = window.localStorage;
      storage.cmtUser = this.username;
      storage.cmtEmail = this.useremail;
      storage.cmtAvatar = this.selectedAvatar.getAttribute('data-avatar');
      this.openSetting = false;
      this.currentAvatar = storage.cmtAvatar;
      this.bus.$emit('closebackdrop');
      this.switchOk();
      this.bus.$emit('popMessageComing', '设置已保存，你可以发送评论了！', 'ok');
    },
    openInfo: function() {
      //点击头像的方法
      //如果loginuser存在，肯定登陆了，阻止后面的面板弹出，告诉用户他已经登陆了
      if(this.loginuser){
        this.bus.$emit('openmodal', 'message', "loginCmt",this.loginuser.nickname);
        return;
      }
      this.openSetting = !this.openSetting;
      this.bus.$emit('openbackdrop');
    },
    selectAvatar: function(event) {
      if (this.selectedAvatar) {
        this.selectedAvatar.classList.remove("avataractive");
        this.selectedAvatar = null;
      }
      event.target.classList.add("avataractive");
      this.selectedAvatar = event.target;
    },
    switchOk: function() {
      this.status = 'ok';
      this.hint = "回车发送";
    },
    sendCmt: function() {
      //评论发送时，先进性基本验证
      if (!this.content) {
        this.bus.$emit('popMessageComing', '别急，填好了内容再发。');
        return;
      }
      if (!this.currentAvatar || !this.username || !this.useremail) {
        this.bus.$emit('popMessageComing', '信息不全，重新设置一下 :P', 'warn');
        return;
      }
      var message = {
        target:this.postid,
        avatarid: this.currentAvatar,
        username: this.username,
        email: this.useremail,
        content: this.content
      }
      //当用户登录时，其实他的头像和昵称就没用了，为了标示这是一个实名评论，加入一个type=reg
      if(this.loginuser){
        message.type = 'reg'
      }
      this.ajax.post(this.apiUrl + 'show/cmt/add',message).then((res) => {
        if(res.data="ok"){
          this.content = '';
          this.bus.$emit('popMessageComing', '已发送', 'ok');
          this.bus.$emit('commentadded');
        }
      })

    }
  },
  //props，id用于定位插入的文章，loginuser只有登录时存在
  props: ['postid','loginuser'],
  //启动钩子
  created: function() {
    //幕布关闭时关闭设置
    this.bus.$on('backdropclosed', () => {
      this.openSetting = false;
    })
    //如果登录，loginuser从post传入，如果有loginuser，必然已登录
    if(this.loginuser){
      //取昵称，email，头像，头像昵称是为了评论框使用，email是为了后台匹配头像用，因为头像昵称都会变化
      this.username = this.loginuser.nickname;
      this.useremail = this.loginuser.email;
      this.currentAvatar = this.loginuser.avatar;
      this.switchOk();
      //打开评论框输入，并退出
      return;
    }
    //当没取到loginuser代表没登录，用本地的storage
    var storage = window.localStorage;
    //如果storage不在，修改hint告诉用户去设置，status为非ok的值阻止输入
    //同时生成一个随机名字给用户
    if (!storage.cmtUser || !storage.cmtEmail || !storage.cmtAvatar) {
      this.status = "unreg";
      this.hint = "点击头像设置信息后即可评论",
      this.username = "匿名用户" + Math.random().toString(36).substr(2, 5).toUpperCase();
    } else {
    //如果storage存在，读取他并打开评论框
      this.username = storage.cmtUser;
      this.useremail = storage.cmtEmail;
      this.currentAvatar = storage.cmtAvatar;
      this.switchOk();
    }
  }
  //总体来说，启动钩子是为了设置初始信息，分歧在于用户登陆后，信息到后端应该如何处理
  //前端的分歧在于：初始化、点击头像时，发送评论时
}
</script>
