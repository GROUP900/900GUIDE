<template>
<div class="panels">
  <h3>标签修改</h3>
  <div class="hr"></div>
  <ul class="itemlist">
    <tagitem v-on:changed="reload" v-for="tag in taglist" :tagname="tag.name" :tagslug="tag.slug" :tagid="tag._id" :key="tag._id"></tagitem>
    <tagitem v-on:changed="reload" v-if="showadd" mode="new"></tagitem>
  </ul>
  <button class="listbutton" @click="switchAdd">添加新标签</button>
</div>
</template>

<script>
import tagitem from './tagitem.vue'
export default {
  name: 'tags',
  data() {
    return {
      taglist: null,
      showadd: false
    }
  },
  components: {
    'tagitem': tagitem
  },
  created: function() {
    this.ajax(this.apiUrl + 'su/tags/get/').then((res) => {
      this.taglist = res.data;
    })
  },
  methods: {
    switchAdd: function() {
      if (this.showadd) {
        this.showadd = false;
        return
      }
      this.showadd = true;
    },
    reload: function() {
      this.showadd = false;
      this.ajax(this.apiUrl + 'su/tags/get/').then((res) => {
        this.taglist = res.data;
      })
    }
  }


}
</script>
