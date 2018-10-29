<template>
<div class="userbg">
  <panelheader></panelheader>
  <transition name="fade" mode="out-in">
      <router-view :key="$route.path"></router-view>
  </transition>
    <modal></modal>
</div>
</template>

<script>
import modal from './modal.vue';
import panelheader from './panelheader.vue'
export default {
  name: 'user',
  components: {
    'panelheader': panelheader,
    'modal': modal
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
