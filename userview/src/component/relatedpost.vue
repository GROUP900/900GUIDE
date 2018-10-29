<template>
<div class='relatedpost' v-infinite-scroll="loadrelated" infinite-scroll-disabled="busy" infinite-scroll-distance="0">
  <p v-if='related[0]'>你可能想看</p>
  <div v-for="post in related">
    <router-link :to="{ name: 'post', params: { id: post._id }}"><img :src='post.headerpic'></router-link>
    <p>
      <router-link :to="{ name: 'post', params: { id: post._id }}">{{post.title}}</router-link>
      <small>{{post.excerpt}}</small>
    </p>
  </div>
</div>
</template>

<script>
export default {
  name: 'comments',
  data() {
    return {
      busy:false,
      related:[]
    }
  },
  watch: {
    '$route' (to, from) {
      this.$router.go(0);
    }
  },
  props: ['title','tags'],
  methods: {
    loadrelated:function(){
      this.busy = true;
      var info = {
        tag:this.tags,
        title:this.title
      }
      this.ajax.post(this.apiUrl + 'show/relatedpost',info).then((res) => {
        this.related=res.data;
      })
    }
  },
  created: function() {

  }
}
</script>
