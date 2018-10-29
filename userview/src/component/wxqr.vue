<template>
<div class="wxqr" v-if='show'>
  <img src="http://open.weixin.qq.com/qr/code/?username=nine00guide">
<p>
长按关注<br>
900指南:小镇青年的周末拯救者
</p>
</div>
</template>

<script>
export default {
  name: 'wxqr',
  data() {
    return {
      show:false
    }
  },
  methods: {

  },
  created: function() {
    var ua = navigator.userAgent.toLowerCase();
    if(/micromessenger/.test(ua)){
      this.show=true;
    }
  }
}
</script>
