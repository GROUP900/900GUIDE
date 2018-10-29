<template>
<li>
  <h4>{{nickname}}</h4>
  <p>{{email}} <a href="#">页面</a> <a v-if="!isbanned" href="#" @click="edituser('ban')">封禁</a><a href='#' @click="edituser('unban')" v-else>解封</a> <a @click="edituser('delete')" href="#">删除</a></p>
</li>
</template>

<script>
export default {
  name: 'useritem',
  props: ['email', 'status', 'nickname', 'id', 'username'],
  data() {
    return {

    }
  },
  computed: {
    isbanned: function() {
      return (this.status == 'active') ? false : true
    }
  },
  methods: {
    edituser: function(type) {
      var info = {
        id: this.id
      }
      switch (type) {
        case 'ban':
          info.type = 'ban';
          break;
        case 'unban':
          info.type = 'unban';
          break;
        case 'delete':
          info.type = 'delete';
          break;
        default:
          return;
      }
      this.ajax.post(this.apiUrl + 'su/users/set/', info).then((res) => {
        if (res.data == 'ok') {
          this.bus.$emit('popMessageComing', 'useredited');
          this.$emit('changed');
        }
      })
    }
  },
  created: function() {

  }
}
</script>
