<template>
<div class="addpost" v-if='display'>
  <form ref="headerpicform" style="display:none;"><input @change="uploadpic('headerpic',$event)" id='headerpicinput' type="file" accept="image/png,image/jpeg" /></form>
  <form ref="addpicform" style="display:none;"><input @change="uploadpic('addpic',$event)" id='addpicinput' type="file" accept="image/png,image/jpeg,image/gif" /></form>
  <p class="guide" @click="modal('review')">投稿须知/说明</p>
  <div class="headerpic">
    <img :src="dispheaderpic">
    <label for='headerpicinput' class="placeholder">
      <div></div>
      <p>点此上传焦点图片<small>需要800 x 450以上</small></p>
    </label>
  </div>
  <input type="text" maxlength="35" v-model="title" placeholder="输入文章标题（最好在15字以内）"></input>
  <input type="text" maxlength="100" v-model="excerpt" placeholder="文章摘要（最多100字）"></input>
  <div class="inputwrapper">
    <input type="text" maxlength="50" v-model="tags" placeholder="文章标签,多个标签以半角逗号分隔"></input>
    <span @click='toggletaglist'>标签列表</span>
  </div>
  <div class="taglist" v-if='showtaglist'>
    <span v-for='tag in taglist' @click='addtag(tag)'>{{tag}}</span>
  </div>
  <p class="guide" @click="modal('editor')">编辑器说明（初次使用必读）</p>
  <div class="editor">
    <div class="toolbar hidden-mobi">
      <div>
        <p><span @click="addelem('h2')">一级标题</span><span @click="addelem('h3')">二级标题</span><span @click="addelem('h4')">三级标题</span></p>
        <p><span @click="addelem('ol')">有序列表</span><span @click="addelem('ul')">无序列表</span></p>
        <p><span @click="addelem('ref')">引用</span><span @click="addelem('bold')">加粗</span></p>
        <p><label for='addpicinput'>添加图片</label><span @click="addelem('href')">超链接</span></p>
      </div>
      <div class="focus" @click='togglefocus'>专注模式</div>
    </div>
    <textarea @keydown.meta.83.prevent="save" @keydown.ctrl.83.prevent="save" v-model='content' placeholder="# 在此编辑正文，请使用markdown语法。"></textarea>
    <div class="previewbtn" @click="togglePreview"><span></span></div>
  </div>
  <p class="previewhint" v-if='showpreview'>格式预览</p>
  <div v-if='showpreview' class="preview" v-html='preview'>
  </div>
  <div class="buttons">
    <div class="submit yellow" @click='submit'>发布</div>
    <div class="draft green" @click='save'>存草稿</div>
  </div>
  <p v-if="mode=='edit'" class="resavehint">注意：如果你的文章已发布，重新发布或存为草稿会使文章隐藏，直到下次提交审核并通过。</p>
</div>


<div class="focusmode" v-else-if='focusmode'>
  <form ref="headerpicform" style="display:none;"><input @change="uploadpic('headerpic',$event)" id='headerpicinput' type="file" accept="image/png,image/jpeg" /></form>
  <form ref="addpicform" style="display:none;"><input @change="uploadpic('addpic',$event)" id='addpicinput' type="file" accept="image/png,image/jpeg,image/gif" /></form>
  <div class="focusutil">
    <div>
    <label for="utiltitle">标题</label>
    <input type="text" id='utiltitle' maxlength="35" v-model="title" placeholder="输入文章标题（最好在15字以内）"></input>
    </div>
    <p>
      <label for='addpicinput' class="addimg">插入图片</label>
      <span @click='togglefocus' class="exit">退出专注模式</span>
    </p>
  </div>
  <textarea v-model='content' @keydown.meta.83.prevent="save" @keydown.ctrl.83.prevent="save" placeholder="# 在此编辑正文，请使用markdown语法。">
  </textarea>
</div>
</template>

<script>
var cos = require("../scripts/cosinit.js");
var marked = require('marked');
export default {
  name: 'editposts',
  data() {
    return {
      showtaglist:false,
      taglist:[],
      display: false,
      content: '',
      showpreview: false,
      tags: '',
      title: '',
      excerpt: '',
      uploadbusy: false,
      headerpic: '',
      mode: '',
      letgowhenRouteLeave: false,
      focusmode:false
    }
  },
  created: function() {
    switch (this.$route.name) {
      case 'addpost':
        this.mode = 'add';
        break;
      case 'editpost':
        this.mode = 'edit';
        break;
    }
    if (this.mode == 'edit') {
      this.ajax(this.apiUrl + 'user/postsource/' + this.$route.params.id).then((res) => {
        if(this.reject(res)){return}
        if(res.data=='authornotmatch'){
          this.$router.replace({
            name: 'index'
          })
          return;
        }
        var post = res.data;
        this.title = post.title;
        this.content = post.content;
        var tags = [];
        for(var i=0;i<post.tags.length;i++){
          tags.push(post.tags[i].name)
        }
        tags = tags.join(',')
        this.tags = tags;
        this.headerpic = post.headerpic;
        this.excerpt = post.excerpt;
        this.display = true;
      })
    }
    if (this.mode == 'add') {
      this.display = true;
    }
    cos.getAppSign = (cb) => {
      this.ajax(this.apiUrl + 'user/cossign').then((res) => {
        cb(res.data)
      })
    };
    var renderer = new marked.Renderer();
    renderer.heading = function(text, level) {
      if (level < 4) {
        return '<h' + (level + 1) + '>' + text + '</h' + (level + 1) + '>'
      } else {
        return '<h' + level + '>' + text + '</h' + level + '>'
      }
    }
    renderer.html = function(html) {
      if (html.indexOf('<iframe') > -1) {
        return "<div class='aspect-ratio'>" + html + '</div>'
      } else {
        return html
      }
    }
    marked.setOptions({
      renderer: renderer
    })
  },
  computed: {
    dispheaderpic: function() {
      if (!this.headerpic) {
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
      } else {
        return this.imgCdn + '/content/' + this.headerpic + '/headerpic';
      }
    },
    preview: function() {
      if (this.content) {
        return marked(this.content);
      } else {
        return '<p>这里是预览区域，你还没有写任何内容，快去写点吧。</p>'
      }
    }
  },
  beforeRouteLeave: function(to, from, next) {
    if (this.letgowhenRouteLeave) {
      return next()
    }
    if (this.content) {
      this.bus.$emit('openmodal', 'leaveconfirm', next);
    } else {
      next()
    }
  },
  methods: {
    togglefocus:function(){
      if(this.focusmode){
        this.focusmode = false;
        this.display = true;
      }else{
        this.focusmode = true;
        this.display = false;
      }
    },
    addtag:function(tagname){
      if(this.tags[this.tags.length-1]==','||!this.tags){
        this.tags+=tagname
      }else{
        this.tags+=(','+tagname)
      }
    },
    toggletaglist:function(){
      if(!this.taglist[0]){
          this.ajax(this.apiUrl + 'user/taglist/').then((res) => {
            this.taglist = res.data;
            this.showtaglist = true;
          })
      }else{
        this.showtaglist = !this.showtaglist;
      }
    },
    submit:function(){
      if(!this.title||!this.excerpt||!this.content||!this.headerpic){
        return this.bus.$emit('popMessageComing', '除了标签都是必填项...填好再发布', 'warn');
      }
      var url ='';
      if(this.mode=='add'){
        url = this.apiUrl + 'user/editpost/submit/new'
      }else if(this.mode=='edit'){
        url = this.apiUrl + 'user/editpost/submit/' + this.$route.params.id;
      }
      var info = {
        title: this.title,
        excerpt: this.excerpt,
        tags: this.tags.split(','),
        content: this.content,
        headerpic: this.headerpic
      }
      this.ajax.post(url, info).then((res) => {
        this.letgowhenRouteLeave = true;
        if(res.data.status=='ok'){
          this.bus.$emit('popMessageComing', '已经发布，请等待审核', 'ok');
          this.$router.replace({
            name: 'userposts'
          })
        }else{
          return this.bus.$emit('popMessageComing', '出错了，请重试', 'warn');
        }
      })
    },
    uploadpic: function(type, ev) {
      var file = ev.target.files[0];
      switch (type) {
        case 'headerpic':
          if (file.size > 2097152) {
            return this.bus.$emit('popMessageComing', '尺寸大于2mb了...裁剪一下再发', 'warn');
          }
          if (file.type == 'image/jpeg' || file.type == 'image/png') {

          } else {
            return this.bus.$emit('popMessageComing', '格式不对', 'warn');
          }
          break;
        case 'addpic':
          if (file.size > 5242880) {
            return this.bus.$emit('popMessageComing', '尺寸大于5mb了...裁剪一下再发', 'warn');
          }
          if (file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/gif') {

          } else {
            return this.bus.$emit('popMessageComing', '格式不对', 'warn');
          }
          break;
        default:
          return;
      }

      if (this.uploadbusy) {
        return this.bus.$emit('popMessageComing', '稍等，另一个文件正在上传', 'warn');
        return;
      }
      this.uploadbusy = true;
      var uri = file.name.split('.')[0] + '-' + Date.now();
      uri = uri.replace(/\W/g,'_');
      cos.uploadFile(
        (cb) => {
          this.uploadbusy = false;
          switch (type) {
            case 'headerpic':
              this.headerpicChanged(uri);
              break;
            case 'addpic':
              this.addpictocontent(uri);
              break;
          }
          this.$refs.headerpicform.reset();
          this.$refs.addpicform.reset();
        },
        () => {
          this.uploadbusy = false;
          this.bus.$emit('popMessageComing', '上传失败了...请重试或联系我们', 'warn');
          this.$refs.headerpicform.reset();
          this.$refs.addpicform.reset();
        },
        (cb) => {
          var progress = parseInt(cb * 100)
          this.bus.$emit('popMessageComing', '正在上传:' + progress + "%", 'ok');
        },
        '900bucket',
        '/content/' + uri, file, 1);
    },
    headerpicChanged: function(uri) {
      this.headerpic = uri;
      this.bus.$emit('popMessageComing', '焦点图已替换', 'ok');
    },
    addpictocontent: function(uri) {
      var url = this.imgCdn + '/content/' + uri + '/mark';
      this.content += '![输入图片描述](' + url + ')\n';
      this.bus.$emit('popMessageComing', '图片标记已追加到文章结尾', 'ok');
    },
    save: function() {
      this.bus.$emit('popMessageComing', '正在保存草稿...', 'ok');
      var info = {
        title: this.title,
        excerpt: this.excerpt,
        tags: this.tags.split(','),
        content: this.content,
        headerpic: this.headerpic
      }
      if (this.mode == 'edit') {
        this.ajax.post(this.apiUrl + 'user/editpost/draft/' + this.$route.params.id, info).then((res) => {
          if (res.data.status == 'ok') {
            this.bus.$emit('popMessageComing', '草稿已保存', 'ok');
          }
        })
      } else if (this.mode == 'add') {
        this.ajax.post(this.apiUrl + 'user/editpost/draft/new', info).then((res) => {
          switch (res.data.status) {
            case 'ok':
              this.letgowhenRouteLeave = true;
              this.$router.push({
                name: 'editpost',
                params: {
                  id: res.data.newid
                }
              })
              this.bus.$emit('popMessageComing', '草稿已保存', 'ok');
          }
        })
      }
    },
    togglePreview: function() {
      this.showpreview = !this.showpreview;
    },
    modal: function(type) {
      switch (type) {
        case 'review':
          this.bus.$emit('openmodal', 'message', "reviewterm");
          break;
        case 'editor':
          this.bus.$emit('openmodal', 'message', "editorhelp");
          break;
      }
    },
    addelem: function(elem) {
      switch (elem) {
        case 'h2':
          this.content += '# 在此输入一级标题\n';
          break;
        case 'h3':
          this.content += '## 在此输入二级标题\n';
          break;
        case 'h4':
          this.content += '### 在此输入三级标题\n';
          break;
        case 'ol':
          this.content += '1. 有序列表\n2. 有序列表\n';
          break;
        case 'ul':
          this.content += '- 无序列表\n- 无序列表\n';
          break;
        case 'ref':
          this.content += '> 引用文字\n\n';
          break;
        case 'bold':
          this.content += '**加粗文字**';
          break;
        case 'href':
          this.content += '[链接文字](http://链接url/)';
          break;
      }
    }
  }
}
</script>
