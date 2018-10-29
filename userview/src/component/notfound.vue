<template>
<div>
  <headerNormal notindex="true"></headerNormal>
    <div class="notfound">
      <div></div>
      <p>
        正常情况下你不应该看到这个页面。<br>
        知道吗，看到这个页面的人中87.5%都在待业，<br>
        闲着的时候更应该抓紧享乐，<br>
        <router-link :to="{ name: 'index'}">马上去首页看看。</router-link>
      </p>
    </div>
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
