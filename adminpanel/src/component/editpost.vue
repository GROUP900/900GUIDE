<template>
<div v-if='display' class="editpost">
  <img class='headerpic' :src='dispheaderpic'>
  <form ref="headerpicform">
    <input type='file' @change="changeheaderpic($event)" accept="image/png,image/jpg,image/gif"></input>
  </form>
  <input type="text" v-model='content.title' placeholder="标题"></input>
  <input type="text" v-model='content.excerpt' placeholder="摘要"></input>
  <input type="text" v-model='tagString' placeholder="标签"></input>
  <textarea v-model='content.content'>
  </textarea>
  <input type='text' v-model='content.resource' placeholder="资源地址"></input>
  <select v-model='content.type'>
    <option value ="post" selected="selected">文章</option>
    <option value ="video">视频</option>
    <option value="audio">音频</option>
  </select>
  <p>创建时间：{{new Date(Date.parse(content.date)).toLocaleString()}}</p>
  <input type='datetime-local' v-model='date'></input>

  <button @click='adopt'>通过</button>

  <input v-model='rejectmessage' placeholder="退回原因"></input>
  <button @click='reject'>退回</button>
</div>
</template>

<script>
var cos = require("../scripts/cosinit.js");
export default {
  name: 'editpost',
  data() {
    return {
      content: {},
      rejectmessage: '',
      date: '',
      tagString:'',
      display:false
    }
  },
  created: function() {
    this.ajax(this.apiUrl + 'su/post/get/' + this.$route.params.id).then((res) => {
      this.content = res.data;
      var tags = [];
      for(var i=0;i<this.content.tags.length;i++){
        tags.push(this.content.tags[i].name)
      }
      tags = tags.join(',');
      this.tagString = tags;
      this.display = true;
    });
    cos.getAppSign = (cb) => {
      this.ajax(this.apiUrl + 'su/cossign').then((res) => {
        cb(res.data)
      })
    };
  },
  computed: {
    dispheaderpic: function() {
      return this.imgCdn + '/content/' + this.content.headerpic + '/headerpic';
    }
  },
  methods: {
    changeheaderpic: function(ev) {
      var file = ev.target.files[0];
      var uri = file.name.split('.')[0] + '-' + Date.now();
      cos.uploadFile(
        (cb) => {
          this.content.headerpic = uri;
          this.$refs.headerpicform.reset();
        },
        () => {
          alert('上传失败了')
        },
        (cb) => {

        },
        '900bucket',
        '/content/' + uri, file, 1);
    },
    adopt: function() {
      var info = this.content;
      info.tagString = this.tagString.split(',');
      if (this.date) {
        info.externaldate = this.date;
      }
      this.ajax.post(this.apiUrl + 'su/posts/set/'+this.$route.params.id, info).then((res) => {
        if (res.data == 'ok') {
          this.$router.push({
            name: 'posts'
          })
        }else if(res.data =='tagnotfound'){
          alert('出现了未保存的标签')
        }
      })
    },
    reject: function() {
      var info = {
        type: 'reject',
        id: this.content._id,
        message: this.rejectmessage
      };
      this.ajax.post(this.apiUrl + 'su/posts/set/', info).then((res) => {
        if (res.data == 'ok') {
          this.$router.push({
            name: 'posts'
          })
        }
      })

    }
  }
}
</script>
