<template>
<div class="editpost">
  <input type="text" v-model='content.slug' placeholder="短名"></input>
  <input type="text" v-model='content.name' placeholder="显示名称"></input>
  <input type="text" v-model='content.list' placeholder="文章列表"></input>
  <form ref="headerpicform">
    大图:{{disphpuri}}
    <input type='file' @change="changeheaderpic($event,'l')" accept="image/png,image/jpg,image/gif"></input>
    小图:{{disphpmobiuri}}
    <input type='file' @change="changeheaderpic($event,'s')" accept="image/png,image/jpg,image/gif"></input>
  </form>
  <button @click='save'>保存</button>
</div>
</template>

<script>
var cos = require("../scripts/cosinit.js");
export default {
  name: 'editcollect',
  data() {
    return {
      content:{},
      addmode:false
    }
  },
  created: function() {
    cos.getAppSign = (cb) => {
      this.ajax(this.apiUrl + 'su/cossign').then((res) => {
        cb(res.data)
      })
    };
    if(this.$route.params.slug=='newcollect'){
      this.addmode = true;
      return;
    }
    this.ajax(this.apiUrl + 'su/collect/get/' + this.$route.params.slug).then((res) => {
      this.content = res.data
    })

  },
  computed: {
    disphpuri: function() {
          return this.imgCdn + '/collectbanner/' + this.content.hp;
        },
        disphpmobiuri: function() {
              return this.imgCdn + '/collectbanner/' + this.content.hpmobi;
            }
  },
  methods: {
    save:function(){
      if(!this.content.slug){
        alert('没有短名')
        return;
      }
      if(typeof(this.content.list)=='string'){
        this.content.list = this.content.list.split(',')
      }
      var uri = '';
      if(this.addmode){
        uri = this.apiUrl + 'su/collect/add/'
      }else{
        uri = this.apiUrl + 'su/collect/set/' + this.$route.params.slug
      }
      this.ajax.post(uri,this.content).then((res) => {
        if(res.data=='ok'){
          this.$router.push({
            name: 'collect'
          })
        }else{
          alert('保存失败')
        }
      })
    },
    changeheaderpic: function(ev,size) {
      var file = ev.target.files[0];
      var uri = file.name.split('.')[0] + '-' + Date.now();
      cos.uploadFile(
        (cb) => {
          switch(size){
            case "l":
              this.content.hp = uri;
              break;
            case "s":
              this.content.hpmobi = uri;
              break;
          }
          this.$refs.headerpicform.reset();
        },
        () => {
          alert('上传失败了')
        },
        (cb) => {

        },
        '900bucket',
        '/collectbanner/' + uri, file, 1);
    }
  }
}
</script>
