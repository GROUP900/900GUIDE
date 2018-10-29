<template>
<div>
  <headerNormal notindex="true"></headerNormal>
    <router-view></router-view>
    <leftBoard></leftBoard>
    <rightBoard></rightBoard>
</div>
</template>

<script>
import leftBoard from './leftboard.vue'
import rightBoard from './rightboard.vue'
import header from './header.vue';
export default {
  name: 'show',
  components: {
    'leftBoard': leftBoard,
    'rightBoard': rightBoard,
    'headerNormal': header
  }
}
</script>
