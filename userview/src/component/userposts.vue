<template>
<div class="userposts">
  <p class="paneltitle up">你的投稿</p>
  <template v-for='(post,index) in postlist'>
    <div :key='post.id'>
    <router-link :to="{ name: 'post',params: { id: post.id }}"><img :src='getheaderpic(post)' class="hidden-mobi"></router-link>
    <div class="info">
      <p class="status" :class="statuscolor(post.status.type)"><span>状态</span>{{statusText(post.status)}}</p>
      <p class="title"><router-link :to="{ name: 'post',params: { id: post.id }}">{{post.title}}</router-link></p>
      <p class="date">{{post.dispdate}}</p>
    </div>
    <div class="buttons">
      <router-link :to="{ name: 'editpost',params: { id: post.id }}"><span class="edit">编辑</span></router-link>
      <span class="remove" @click='droppost(post.id,index)'>删除</span>
    </div>
  </div>
  <p v-if="post.status.type=='reject'" class="rejecthint">oh...稿件因为某些原因被退回了，你可以进行修改或联系我们:user@nine00.com</p>
</template>
  <p @click='loadmore' class="loadmorebtn" v-if='showloadmore'><span>加载更多</span></p>
  <p class="hint" v-if='!postlist[0]'><router-link :to="{ name: 'addpost'}">还没投稿过呢，去写一篇吗？</router-link></p>
</div>
</template>

<script>
export default {
  name: 'userpost',
  data() {
    return {
      postlist: [],
      showloadmore:false
    }
  },
  created: function() {
    this.reload();
  },
  methods: {
    loadmore:function(){
      this.ajax(this.apiUrl + 'user/getuserposts/'+this.postlist.length).then((res) => {
        this.postlist = this.postlist.concat(res.data.posts);
        if(res.data.final){
          this.showloadmore = false
        }
      })
    },
    getheaderpic:function(post){
      if(!post.headerpic){
        return this.imgCdn + '/util/placeholder.jpg/headerpic';
      }else{
        return post.dispheaderpic;
      }
    },
    statuscolor:function(type){
      switch(type){
        case 'draft':
        case 'revision':
          return 'yellow'
          break;
        case 'ok':
          return 'green'
          break;
        case 'reject':
          return 'red'
      }
    },
    statusText(status) {
      switch (status.type) {
        case 'draft':
          return '草稿';
          break;
        case 'showing':
          return '已发布';
          break;
        case 'reject':
          return '被退回：' + status.message;
          break;
        case 'revision':
          return '审核中';
          break;
      }
    },
    reload: function() {
      this.ajax(this.apiUrl + 'user/getuserposts').then((res) => {
        this.postlist = res.data.posts;
        this.showloadmore = (res.data.final)?false:true;
      })
    },
    droppost: function(id,index) {
      this.ajax(this.apiUrl + 'user/userdroppost/' + id).then((res) => {
        if (res.data == 'ok') {
          this.postlist.splice(index,1);
          this.bus.$emit('popMessageComing', '文章已删除', 'ok');
        } else {
          this.bus.$emit('popMessageComing', '删除失败', 'warn');
        }
      })
    }
  }
}
</script>
