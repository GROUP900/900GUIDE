<template>
<div>
  <panelheader notlogin='true'></panelheader>
  <div class="loginbox">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</div>
</template>

<script>
import panelheader from './panelheader.vue'
export default {
  name: 'account',
  components: {
    'panelheader': panelheader
  },
  data() {
    return {

    }
  },
  created: function() {

  },
  methods: {}
}
</script>
