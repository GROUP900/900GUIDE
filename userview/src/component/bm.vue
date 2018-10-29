<template>
<div>
  <p class="paneltitle bm">你的收藏</p>
  <section class="post_list panel">
    <div v-for='post in bmposts' class="post_block">
      <rpost :key='post._id' :data='post'></rpost>
    </div>
    <div v-for="n in 6" class="post_offset"></div>
  </section>
  <transition name="bottomin">
    <div @click='remove' v-if="removelist[0]" class="removeselected">从收藏中移出</div>
  </transition>
  <p @click='loadmore' class="loadmorebtn right" v-if='showloadmore'><span>加载更多</span></p>
  <p class="hint" v-if="bmposts.length==0"><router-link :to="{ name: 'index'}">没有收藏的内容，去转转吧</router-link></p>
</div>
</template>

<script>
import rpost from './rpost.vue'
export default {
  name: 'bm',
  data() {
    return {
      bmposts:[],
      removelist:[],
      showloadmore:false,
      page:1
    }
  },
  created: function() {
    this.reload();
    this.bus.$on('editrlist',(type,id)=>{
      if(type=='add'){
        this.removelist.push(id)
      }else{
        var index = this.removelist.indexOf(id);
        this.removelist.splice(index, 1);
      }
    });
  },
  components:{
    'rpost':rpost
  },
  methods: {
    reload:function(){
      this.ajax(this.apiUrl + 'user/getbm/').then((res) => {
        this.bmposts = res.data.posts;
        this.showloadmore = (res.data.final) ? false:true;
      })
    },
    loadmore:function(){
      this.ajax(this.apiUrl + 'user/getbm/'+this.page).then((res) => {
        this.bmposts = this.bmposts.concat(res.data.posts);
        this.page++;
        if(res.data.final){
          this.showloadmore = false
        }
      })
    },
    remove:function(){
      this.ajax.post(this.apiUrl + 'user/removebm',this.removelist).then((res) => {
        if(res.data=='ok'){
          this.bus.$emit('popMessageComing', '已删除收藏','ok');
          this.reload();
          this.removelist = []
        }
      })
    }
  }
}
</script>
