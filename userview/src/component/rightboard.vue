<template>
<transition name="rightboard">
  <section id="tag" v-if="show" @touchmove.prevent>
    <div class="control">
      <span id="reroll" @click='load'></span>
      <span class="close" @click="closerightBoard"></span>
    </div>
    <ul id="taglist" @click="closerightBoard">
      <li v-if='!taglist'><a href="#">Loading...</a></li>
      <li v-for="tag in taglist" v-if='taglist'>
        <router-link :to="{ name: 'list', params: { type:'tag',param: tag.slug,page:1 }}">{{tag.name}}</router-link>
      </li>
    </ul>
  </section>
</transition>
</template>

<script>
export default {
  name: 'rightBoard',
  data() {
    return {
      show: false,
      taglist: null
    }
  },
  methods: {
    closerightBoard: function() {
      this.show = false;
      this.bus.$emit('closebackdrop')
    },
    load: function() {
      if(this.load.busy){return;}
      this.load.busy = true;
      var firstItem = document.querySelector('#taglist>li'),
        windowHeight = window.innerHeight - firstItem.offsetTop,
        numtoLoad = Math.floor(windowHeight / firstItem.offsetHeight);
      this.ajax(this.apiUrl + 'show/randomtags/' + numtoLoad).then((res) => {
        this.taglist = res.data;
        this.load.busy = false;
      })
    }
  },
  created: function() {

    this.bus.$on('openrightBoard', () => {
      this.show = true;
      if (this.taglist==null) {
        setTimeout(()=>{this.load();},0)
      }
    })
    this.bus.$on('backdropclosed', () => {
      this.show = false;
    })
  }
}
</script>
