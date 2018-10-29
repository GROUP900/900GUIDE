<template>
  <article>
    <div @click="toggle" :class="{active:selected}" class="removebtn"><span></span></div>
    <div class="aspect-ratio"><router-link :to="{ name: 'post', params: { id: data._id }}"><img :src="data.headerpic"></router-link></div>
    <h3><router-link :to="{ name: 'post', params: { id: data._id }}">{{data.title}}</router-link></h3>
    <p>{{data.excerpt}}</p>
  </article>
</template>

<script>
export default {
  name: 'rpost',
  data() {
    return {
      selected:false
    }
  },
  props:['data'],
  created: function() {

  },
  methods:{
    toggle:function(){
      if(!this.selected){
        this.bus.$emit('editrlist', 'add',this.data._id);
      }else{
        this.bus.$emit('editrlist', 'remove',this.data._id);
      }
      this.selected = !this.selected
    }
  }


}
</script>
