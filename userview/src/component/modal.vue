<template>
<div v-if="display" class="modal">
  <div v-html="resource"></div>
  <ul v-if="tag" class="tags">
    <li v-for="tag in tags">
      <router-link :to="{ name: 'list', params: { type: 'tag',page:1,param:tag.slug }}">{{tag.name}}</router-link>
    </li>
  </ul>
  <span v-if='leaveconfirm' @click='gonext(nextpage)' class='confrimleave'>离开</span>
</div>
</template>

<script>
export default {
  name: 'backdrop',
  data() {
    return {
      resource: '',
      display: false,
      tag: false,
      leaveconfirm: false,
      tags: [],
      nextpage:''
    }
  },
  watch: {
    '$route' (to, from) {
      this.display = false;
    }
  },
  methods: {
    gonext:function(){
      this.nextpage()
    }
  },
  created: function() {
    this.bus.$on('openmodal', (type, resource, extra) => {
      this.leaveconfirm = false;
      switch (type) {
        case "qr":
          this.resource = "<img src='" + resource + "' >";
          break;
        case "tag":
          this.tags = resource;
          this.tag = true;
          break;
        case 'leaveconfirm':
          this.leaveconfirm = true;
          this.nextpage = resource;
          this.resource="你已经写了一些内容了，不保存就离开吗";
          break;
        case 'simple':
          this.resource = resource;
          break;
        case "message":
          switch (resource) {
            case 'upset':this.resource = "这是你的个人主页，此页面将对其他用户展示<br>你可以设置需要展示的信息和自定义的焦点图片<br>请勿上传不宜展示的图片。"
            break;
            case 'bmNeedsignin':
              this.resource = "收藏文章需要先登录<br>现在去<a href='/account/signup/'> 注册 </a>或<a href='/account/signin/'> 登录</a>"
              break;
            case 'loginCmt':
              this.resource = "你已经登陆了，名字将显示为 " + extra + "<br>点 <a href='/user/settings/'>这里</a> 去修改<br><br>切换匿名请 <a href='/user/logout/'>注销</a>"
              break;
            case 'settingContact':
              this.resource = "如果你使用投稿功能且愿意我们协助你的创作<br>请填写邮箱外可以联络到你的联系方式<br>这是我们唯一可能联系你的方式<br>可以是QQ，微信，或邮箱等联系方式<br>信息不会公开"
              break;
            case 'resetmail':
              this.resource = "你正在修改登录邮箱，一条代码已发送到你的旧邮箱" + extra + "<br><br>请确认你的新邮箱有效，否则无法找回密码与更换邮箱"
              break;
            case 'mailchanged':
              this.resource = "邮箱已变更为<br>" + extra + "<br>5秒后注销"
              break;
            case 'reviewterm':
              this.resource = "<p style='text-align:left'>I. 在投稿展示之前，900会审核你的稿件，如果文章非原创，请确认你拥有作者的授权，无断转载将导致你的账号永久封停。<br>II. 我们不会修改你投递稿件的正文部分，包含不适宜展示的内容会直接退回，但可能会为了更好的显示效果进行样式（焦点图片、摘要、标签、markdown标记）修改。<br>III. 你保留稿件的所有权利，你可以把投递到900的稿件同时转载到任何地方并在任何时候删除你的稿件。<br>IV. 不通过的稿件会在审核后立即退回，已通过的稿件可能会保留一段时间后再发布，如已提交审核，请耐心等待或与我们联系。<br>V. 900通过标签来进行所有内容的分类和关联，我们建议你使用范围尽量宽泛的标签，使用列表中已有的标签就很好。你也可以通过一个自定的新标签来扩展900的标签列表，但很有可能在审核时被去掉。<br><br>投稿代表你默许以上条款，如有相关纠纷概不受理。</p>"
              break;
            case 'editorhelp':
              this.resource = "<p style='text-align:left'>900的稿件需要使用markdown(md)语法，他可以帮助你专注于写作而不是把时间用在处理文章字体的样式。<br><br>如果你还不会，可以先花10分钟学习一下，不然你的投稿可能会被因为格式混乱退回。<br>md兼容html格式，所以你也可以把外部引用代码（视频引用等）粘贴到这里，但请不要使用自定的CSS样式，这可能也会让你的文章无法通过审核。<br>另外，在编辑器输入时按下ctrl+s可以快速保存草稿<br><br>当你在移动设备上编辑文章时，我们推荐你使用第三方md编辑器App，然后粘贴到这里</p>"
              break;
          }
          break;
      }
      this.display = true;
      this.bus.$emit('openbackdrop');
    })
    this.bus.$on('backdropclosed', () => {
      this.display = false;
      this.leaveconfirm = false;
      this.tag = false;
      this.resource = '';
    })
  }
}
</script>
