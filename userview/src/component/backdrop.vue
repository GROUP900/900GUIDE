<template>
<transition name="fade">
  <div v-show="display" class="backdrop" @click="closebackdrop" @touchmove.prevent>
  </div>
</transition>
</template>

<script>
export default {
  name: 'backdrop',
  data() {
    return {
      lazy:false,
      display: false
    }
  },
  watch: {
    '$route' (to, from) {
      this.display = false;
    }
  },
  methods:{
    closebackdrop:function(){
      this.display=false;
      this.bus.$emit('backdropclosed');
    }
  },
  created: function() {
    this.bus.$on('openbackdrop', () => {
      this.display = true;
    })
    this.bus.$on('closebackdrop', () => {
      this.closebackdrop();
    })
  }
}
</script>
