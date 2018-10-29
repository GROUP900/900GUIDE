<template>
<transition name="fade">
<div v-if="display">
  <section class="post_list list">
    <div v-for='post in posts' class="post_block">
      <article>
        <div class="aspect-ratio"><router-link :to="{ name: 'post', params: { id: post._id }}"><img :src="post.headerpic"></router-link></div>
        <h3><router-link :to="{ name: 'post', params: { id: post._id }}">{{post.title}}</router-link></h3>
        <p>{{post.excerpt}}</p>
      </article>
    </div>
    <div v-for="n in 6" class="post_offset"></div>
  </section>
  <div v-if="showpager" class="pager">
    <router-link :to="{ name: 'list', params: { type: type,page:page,param:param }}">next page</router-link>
  </div>
</div>
</transition>
</template>

<script>
export default {
  name: 'list',
  data() {
    return {
      display:false,
      posts: [],
      showpager: true,
      type: "default",
      page: 0,
      param: "default"
    }
  },
  watch: {
    '$route' (to, from) {
      this.init();
    }
  },
  created: function() {
    this.init();
  },
  methods: {
    init: function() {
      switch (this.$route.params.type) {
        case "tag":
          this.ajax(this.apiUrl + 'show/getfulltagname/' + this.$route.params.param).then((res) => {
            if(this.reject(res)){return};
            this.bus.$emit('popMessageComing', '标签 ' + res.data + ' 下的文章，页数：' + this.$route.params.page);
            this.ajax(this.apiUrl + 'show/list/tag/' + this.$route.params.param + "/" + this.$route.params.page).then((res) => {
              this.posts = res.data;
              this.setpager("tag")
            })
          })
          break;
        case "post":
          this.ajax(this.apiUrl + 'show/getpostpages/').then((res) => {
            this.bus.$emit('popMessageComing', '所有文章，页数：' + this.$route.params.page + '/' + res.data);
            this.ajax(this.apiUrl + 'show/list/post/' + this.$route.params.page).then((res) => {
              this.posts = res.data;
              this.setpager("post")
            })
          })
          break;
        case 'search':
            this.bus.$emit('popMessageComing', '关键词：' + this.$route.params.param + '的搜索结果，页数：' + this.$route.params.page);
            this.ajax(this.apiUrl + 'show/list/search/' + this.$route.params.param + "/" + this.$route.params.page).then((res) => {
              this.posts = res.data;
              this.setpager("search")
            })
        break;
      }
    },
    setpager: function(type) {
      this.display=true;
      if (this.posts.length < 36) {
        this.showpager = false
      } else {
        this.showpager = true
      };
      this.type = type;
      switch (type) {
        case "post":
          this.param ="hold";
          break;
        case "tag":
        case "search":
          this.param = this.$route.params.param;
          break;
      }
      this.page = Number(this.$route.params.page) + 1;
    }
  }
}
</script>
