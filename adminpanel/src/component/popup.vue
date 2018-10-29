<template>
<transition name="topin">
  <p v-show="display" class="popup">
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
      timer: ''
    }
  },
  created: function() {
    this.bus.$on('popMessageComing', (type, message) => {
      clearTimeout(this.timer);
      switch (type) {
        case 'loginSuccess':
          this.info = '成功,正在转向控制台';
          break;
        case 'loginAlready':
          this.info = '已经登录了，正在转向控制台';
          break;
        case 'loginUser':
          this.info = '用户名不存在';
          break;
        case 'loginPw':
          this.info = '密码错误';
          break;
        case 'logout':
          this.info = '已经注销';
          break;
        case 'configSuccess':
          this.info = message + '设置已保存';
          break;
        case 'reapeaterr':
          this.info = '重复的密码不同'
          break;
        case 'notmatching':
          this.info = '不匹配'
          break;
        case 'tagedited':
          this.info = '标签修改已生效'
          break;
        case 'useredited':
          this.info = '用户修改已生效'
          break;
        default:
          return;
      };
      this.display = true;
      this.timer = setTimeout(() => this.display = false, 1500)
    })
  }


}
</script>
