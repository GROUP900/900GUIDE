<template>
  <transition name="topin">
  <p v-if="display" class="popup" v-bind:style="{ background: specifyColor}">
    {{info}}
  </p>
</transition>
</template>

<script>
export default {
  name: 'popup',
  data() {
    return {
      display: false,
      info: '',
      timer: '',
      specifyColor:""
    }
  },
  created: function() {
    this.bus.$on('popMessageComing', (message,specifyColor) => {
      clearTimeout(this.timer);
      switch(specifyColor){
        case 'ok' : this.specifyColor = '#4CAF50';break;
        case 'warn' : this.specifyColor = '#f44336';break;
        default:this.specifyColor = specifyColor;break;
      }
      this.info=message;
      this.display = true;
      this.timer = setTimeout(() => this.display = false, 1500)
    })
  }


}
</script>
