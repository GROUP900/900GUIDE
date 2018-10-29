<template>
<div class="panels">
  <h3>特辑管理</h3>
  <div class="hr"></div>
  <ul class="itemlist">
<li v-for="item in collectlist">
      <h4>{{item.name}}</h4>
      <p><router-link :to="{ name: 'editcollect', params: { slug: item.slug }}">编集</router-link><span @click="dropcollect(item.slug)">删除</span></p>
</li>
  </ul>
    <button class="listbutton" @click='addnewcollect'>添加新合集</button>
</div>
</template>

<script>
export default {
  name: 'collect',
  components: {

  },
  data() {
    return {
      collectlist:[]
    }
  },
  watch: {

  },
  created: function() {
    this.reload();
  },
  methods: {
    reload:function(){
      this.ajax(this.apiUrl + 'su/collects/get').then((res) => {
        this.collectlist = res.data
      })
    },
    dropcollect:function(slug){
      this.ajax(this.apiUrl + 'su/collects/drop/'+slug).then((res) => {
        if(res.data=='ok'){
            this.reload();
        }
      })
    },
    addnewcollect:function(){
      this.$router.push({
        name: 'editcollect',
        params: { slug: 'newcollect' }
      })
    }
  }
}
</script>
