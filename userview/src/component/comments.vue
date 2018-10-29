<template>
<div class="comments" v-infinite-scroll="scrollToCmt" infinite-scroll-disabled="busy" infinite-scroll-distance="100">
  <p v-if="!lazy" class="loading" v-text="hint"></p>
  <div v-if="lazy" v-for="comment in comments" :key="comment._id">
    <router-link :to="userpage(comment)"><img :src="comment.avatarurl"></router-link>
    <p><span class="type" v-if="!comment.reg">匿名</span>
      <router-link :to="userpage(comment)"><span class="name" v-text="comment.author"></span></router-link>
      <span class="time" v-text="comment.disptime"></span>{{comment.content}}</p>
  </div>
</div>
</template>

<script>
export default {
  name: 'comments',
  data() {
    return {
      comments: null,
      lazy: false,
      busy: false,
      hint: 'Now Loading...',
    }
  },
  props: ['postid'],
  methods: {
    userpage:function(comment){
      if(comment.reg){
        return { name: 'userpage', params: { username: comment.authorId }}
      }else{
        return '#'
      }
    },
    scrollToCmt: function() {
      this.busy = true;
      this.loadComments();
    },
    loadComments: function() {
      this.ajax(this.apiUrl + 'show/cmt/' + this.$route.params.id).then((res) => {
        this.comments = res.data;
        if (!res.data.length) {
          this.hint='还没有评论，你来评论一下？'
        } else {
          this.lazy = true;
        }
      });
    }
  },
  created: function() {
    this.bus.$on('commentadded', () => {
      this.loadComments();
    })
  }
}
</script>
