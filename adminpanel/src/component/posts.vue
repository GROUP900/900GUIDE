<template>
<div class="panels">
  <h3>文章管理</h3>
  <input v-model='selectdate' type='month' class="timeselect"></input>
  <div class="hr"></div>
  <ul class="itemlist">
    <li v-for= '(post,index) in postlist' :key='post.id'>
      <h4><a :href="frontUrl+'show/post/'+post.id" target="_blank">{{post.title}}</a></h4>
      <p>{{getstatustext(post.status.type)}} <router-link :to="{ name: 'editpost', params: { id: post.id }}">编集</router-link> <span @click="modifypost({type:'reject',id:post.id},index)" v-if="post.status.type=='revision'">直接退回</span> <span @click="modifypost({type:'adopt',id:post.id},index)" v-if="post.status.type=='revision'">直接通过</span> <span @click="modifypost({type:'adopt',id:post.id},index)" v-if="post.status.type=='deleted'">上架</span> <span @click="modifypost({type:'delete',id:post.id},index)" v-if="post.status.type!='deleted'">删除</span> <span @click="modifypost({type:'crush',id:post.id},index)" v-if="post.status.type=='deleted'">彻底删除</span></p>
    </li>
  </ul>
</div>
</template>

<script>
export default {
  name: 'posts',
  components: {

  },
  data() {
    return {
      postlist:[],
      date:'',
      selectdate:''
    }
  },
  watch: {
    selectdate:function(n,o){
      if(!n){return}
      this.date = Date.parse(n);
      this.reload();
    }
  },
  created: function() {
    this.date = new Date();
    this.reload();
  },
  methods: {
    reload:function(){
      this.ajax(this.apiUrl + 'su/posts/get/'+Number(this.date)).then((res) => {
        this.postlist = res.data
      })
    },
    getstatustext:function(type){
      switch(type){
        case 'revision':return '待审';break;
        case 'deleted':return '被删除';break;
        case 'showing':return '显示中';break;
        case 'reject':return '已退回';break;
      }
    },
    modifypost:function(info,index){
      this.ajax.post(this.apiUrl + 'su/posts/set/',info).then((res) => {
        if(res.data=='ok'){
          switch(info.type){
            case 'crush':
              this.postlist.splice(index,1);
              break;
            case 'delete':
              this.postlist[index].status.type = 'deleted';
              break;
            case 'adopt':
              this.postlist[index].status.type = 'showing';
              break;
            case 'reject':
              this.postlist[index].status.type = 'reject';
              break;
            default:
              this.reload();
          }
        }
      })
    }
  }
}
</script>
