<template>
<div>
  <section id="jumbotron">
    <headerIndex></headerIndex>
    <div id="cover">
      <router-link :to="banner.url">
        <template v-if='display'>
          <img class="hidden-mobi" :src="bannerUrl">
          <img class="hidden-dt" :src="mobiBannerUrl">
        </template>
        <div id="cover_title">
          <span>Cover Story</span>
          <h2>{{banner.title}}</h2>
          <span>{{banner.intro}}</span>
        </div>
      </router-link>
    </div>
  </section>
  <section class="post_list padding" v-infinite-scroll="loadmore" infinite-scroll-disabled="busy" infinite-scroll-distance="100">
    <div v-for='post in posts' class="post_block">
      <article>
        <div class="aspect-ratio"><router-link :to="{ name: 'post', params: { id: post._id }}"><img :src="post.headerpic"></router-link></div>
        <h3><router-link :to="{ name: 'post', params: { id: post._id }}">{{post.title}}</router-link></h3>
        <p>{{post.excerpt}}</p>
      </article>
    </div>
    <div v-for="n in 6" class="post_offset"></div>
  </section>
  <p class="indexloading" v-show="showloading">Now Loading...</p>
  <div v-if="!showloading" class="pager">
    <router-link :to="{ name: 'list', params: { type: 'post',page:2,param:'default' }}">next page</router-link>
  </div>
  <leftBoard></leftBoard>
  <rightBoard></rightBoard>
</div>
</template>

<script>
import leftBoard from './leftboard.vue'
import rightBoard from './rightboard.vue'
import header from './header.vue'
export default {
  name: 'index',
  data() {
    return {
      busy: false,
      page: 1,
      posts: [],
      banner: {url:''},
      loaderControl: {
        blocksasync:12,
        blocksonpage:36,
        commentasync:12
      },
      bannerUrl: '',
      mobiBannerUrl: '',
      showloading: true,
      display:false
    }
  },
  created: function() {
      this.ajax(this.apiUrl + 'show/index').then((res) => {
        var data = res.data;
        this.posts = data.posts;
        this.banner = data.banner;
        this.bannerUrl = this.imgCdn + '/banner/' + this.banner.id + '.jpg';
        this.mobiBannerUrl = this.imgCdn + '/banner/' + this.banner.id + '_mobi.jpg';
        this.display=true;
        setTimeout(()=>{this.checkdatalength(this.posts);},0)
      })
    },
  methods: {
    loadmore: function() {
      this.busy = true;
      if(!this.posts[0]){
        this.busy = false;
        return;
      }
      if (this.posts.length < this.loaderControl.blocksonpage) {
        this.loadposts();
      } else {
        this.showloading = false;
      }
    },
    loadposts: function() {
      this.ajax(this.apiUrl + 'show/index/' + this.page).then((res) => {
        this.posts = this.posts.concat(res.data);
        if(!this.checkdatalength(res.data)){  
          this.page++;
          this.busy = false;
        }
      });
    },
    checkdatalength:function(data){
      if (data.length < this.loaderControl.blocksasync) {
        this.busy = true;
        this.showloading = false;
        return true;
      }
    }
  },
  components: {
    'leftBoard': leftBoard,
    'rightBoard': rightBoard,
    'headerIndex': header
  }
}
</script>
