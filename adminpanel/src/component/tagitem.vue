<template>
<li>
      <template v-if="!edit">
        <h4><a href="#">{{tagname}}</a></h4>
        <p><a href="#" @click="switchEdit">编辑</a> <a href="#" @click="deleteTag">删除</a></p>
      </template>
      <template v-else>
        <label>标签名：</label>
        <input type="text" v-model="editedName" placeholder="在此输入标签名">
        <label>短名：</label>
        <input type="text" v-model="editedSlug" placeholder="在此输入短名">
        <p><a v-if="!this.mode" href="#" @click="switchEdit">取消</a> / <a href="#" @click="setTag">更新</a></p>
      </template>
    </li>

</template>

<script>
export default {
  name: 'tagitem',
  props: ['tagname', 'tagslug', 'tagid', 'mode'],
  data() {
    return {
      edit: false,
      editedName: this.tagname,
      editedSlug: this.tagslug
    }
  },
  methods: {
    switchEdit: function() {
      if (this.edit) {
        this.edit = false;
        return;
      }
      this.edit = true;
    },
    deleteTag: function() {
      var info = {
        type: 'delete',
        id: this.tagid
      }
      this.ajax.post(this.apiUrl + 'su/tags/set/', info).then((res) => {
        if (res.data == 'ok') {
          this.bus.$emit('popMessageComing', 'tagedited');
          this.$emit('changed');
        }
      })
    },
    setTag: function() {
      if (this.mode == 'new') {
        var info = {
          type: 'add',
          slug: this.editedSlug,
          name: this.editedName
        }
      } else {
        var info = {
          type: 'set',
          id: this.tagid,
          slug: this.editedSlug,
          name: this.editedName
        }
      }
      this.ajax.post(this.apiUrl + 'su/tags/set/', info).then((res) => {
        if (res.data == 'ok') {
          this.bus.$emit('popMessageComing', 'tagedited');
          this.$emit('changed');
          this.edit = false;
        }
      })
    }
  },
  created: function() {
    if (this.mode == 'new') {
      this.edit = true
    }
  }
}
</script>
