<template>
  <header :class="{ white: notindex }" v-once>
      <span id="menu_trigger" @click="openLeftBoard">菜单</span>
      <router-link :to="{ name: 'index'}"><h1>900生活指南</h1></router-link>
      <span id="tag_trigger" @click="openRightBoard">标签</span>
  </header>
</template>

<script>
export default {
    name: 'header',
    props:['notindex'],
    methods:{
      openLeftBoard:function(){
        this.bus.$emit('openbackdrop');
        this.bus.$emit('openleftBoard');
      },
      openRightBoard:function(){
        this.bus.$emit('openbackdrop');
        this.bus.$emit('openrightBoard');
      }
    }
}
</script>
