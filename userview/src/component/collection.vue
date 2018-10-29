<template>
<div v-if='display' class="collection" v-title :data-title="'特辑 ' + content.name +' | 900指南'">
  <div class="cover">
    <router-link class='back900' :to="{ name: 'index'}"><span></span></router-link>
    <p class="title"><small>特辑</small>{{content.name}}</p>
      <img :src='content.hp' class="hidden-mobi">
      <img :src='content.hpmobi' class="hidden-dt">
  </div>
  <section class="post_list list">
    <div v-for='post in content.posts' class="post_block">
      <article>
        <div class="aspect-ratio">
        <router-link :to="{ name: 'post', params: { id: post._id }}"><img :src="post.headerpic"></router-link>
        </div>
        <h3><router-link :to="{ name: 'post', params: { id: post._id }}">{{post.title}}</router-link></h3>
        <p>{{post.excerpt}}</p>
      </article>
    </div>
    <div v-for="n in 6" class="post_offset"></div>
  </section>
</div>
</template>

<script>
export default {
  name: 'collection',
  data() {
    return {
      content:{},
      display:false
    }
  },
  created: function() {
    this.ajax(this.apiUrl + 'show/getcollection/'+this.$route.params.slug).then((res) => {
      if(this.reject(res)){return};
      this.content = res.data;
      this.display = true;
    })
  }
}
</script>
