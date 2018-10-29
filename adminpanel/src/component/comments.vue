<template>
<div class="panels">
  <h3>评论管理</h3>
  <input v-model='selectdate' type='month' class="timeselect"></input>
  <div class="hr"></div>
  <ul class="itemlist">
    <li v-for='(comment,index) in commentlist'>
      <h4>{{comment.content}}</h4>
      <p>作者:{{comment.author}} <a :href="frontUrl+'show/post/'+comment.linkto" target="_blank" :title='comment.linkedpost'>来源</a> <span @click="drop(comment._id,index)">删除</span></p>
    </li>
  </ul>
</div>
</template>

<script>
export default {
  name: 'comments',
  data() {
    return {
      commentlist:[],
      date:'',
      selectdate:''
    }
  },
  components: {

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
    this.reload()
  },
  methods: {
    reload:function(){
      this.ajax(this.apiUrl + 'su/comments/get/'+Number(this.date)).then((res) => {
        this.commentlist = res.data;
      })
    },
    drop:function(id,index){
      this.ajax(this.apiUrl + 'su/comments/drop/'+id).then((res) => {
        if(res.data == 'ok'){
          this.commentlist.splice(index,1)
        }
      })
    }
  }


}
</script>
<style scoped>
.dashedlink {
  position: absolute;
  top: 12px;
  right: 30px;
}
</style>
