<template>
<div>
  <div class="panelheader">
    <router-link :to="{ name: 'index'}">
      <div class="index"></div>
    </router-link>
    <div v-if="!notlogin" class="util">
      <ul class="hidden-mobi">
        <router-link :to="{ name: 'userposts'}">
          <li class="posts"></li>
        </router-link>
        <router-link :to="{ name: 'addpost'}">
          <li class="add"></li>
        </router-link>
        <router-link :to="{ name: 'bm'}">
          <li class="bm"></li>
        </router-link>
        <router-link :to="{ name: 'settings'}">
          <li class="setting"></li>
        </router-link>
      </ul>
      <router-link :to="{ name: 'logout'}"><span>注销</span></router-link>
    </div>
  </div>
  <div v-if="!notlogin" class="hidden-dt util">
    <ul>
      <router-link :to="{ name: 'userposts'}">
        <li class="posts"></li>
      </router-link>
      <router-link :to="{ name: 'addpost'}">
        <li class="add"></li>
      </router-link>
      <router-link :to="{ name: 'bm'}">
        <li class="bm"></li>
      </router-link>
      <router-link :to="{ name: 'settings'}">
        <li class="setting"></li>
      </router-link>
    </ul>
  </div>
</div>
</template>

<script>
export default {
  name: 'panelheader',
  props: ['notlogin']
}
</script>
