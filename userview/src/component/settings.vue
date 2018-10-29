<template>
<div class="settingbox" v-if='display'>
  <section>
    <p>修改头像</p>
    <div class="avatar">
      <form ref="avatarform" style="display:none;"><input @change="changeAvatar" v-if="!uploadPrevent" id='avatar' type="file" accept="image/png,image/gif,image/jpeg" /></form>
      <img :src="avatarUrl"><label for="avatar">{{uploadPrevent?'5秒后可以修改':'选择'}}</label>
    </div>
  </section>
  <section>
    <p>修改昵称</p>
    <div class="item"><input type="text" v-model="nickname"></div>
    <div class="confirm"><span @click="update('nickname')">确认</span></div>
  </section>
  <section>
    <p>联系方式</p>
    <div class="item"><input type="text" v-model="contact" placeholder="使用投稿请留下联系方式">
      <div @click='contactModal' class="info"></div>
    </div>
    <div class="confirm"><span @click="update('contact')">确认</span></div>
  </section>
  <section>
    <p>修改密码</p>
    <div class="item"><input type="password" v-model="oldpw" placeholder="输入旧密码"></div>
    <div class="item"><input type="password" v-model="newpw" placeholder="输入新密码"></div>
    <div class="item"><input type="password" v-model="repeatpw" placeholder="重复新密码"></div>
    <div class="confirm"><span @click="update('pw')">确认</span></div>
  </section>
  <section>
    <p>密保邮箱</p>
    <div class="item" v-if='!resetemail'><input type="text" disabled :value="email"></div>
    <template v-if='resetemail'>
    <div class="item"><input type="text" v-model="newemail" placeholder='输入新邮箱'></div>
    <div class="item"><input type="text" v-model="secret" placeholder="输入邮箱中的代码"></div>
    <div class="item"><input type="password" v-model="pwtoresetmail" placeholder="输入登录密码"></div>
</template>
    <div class="confirm"><span v-if='resetemail' @click='confirmnewmail'>确认修改</span><span v-if='!resetemail' @click='switchresetemail'>修改</span></div>
  </section>
  <router-link :to="{ name: 'userpage', params: { username: this.username }}">
    <div class="fluidbtn">
      去编辑个人主页
    </div>
  </router-link>
  <div class="logo"></div>
</div>
</template>

<script>
//引入cos
var cos = require("../scripts/cosinit.js");
export default {
  name: 'setting',
  data() {
    return {
      username: '', //用户名 生成头像用
      email: '', //初始化验证与现实
      nickname: '',
      avatarUrl: '', //初始化头像
      contact: '',
      oldpw: '',
      newpw: '',
      repeatpw: '',
      newemail: '', //修改密码
      secret: '',
      pwtoresetmail: '',
      resetemail: false, //显示重置密码面板
      newavataruri: '', //新头像url，修改后显示用
      uploadPrevent: false, //阻止5秒内重复上传
      display: false //加一个lazy
    }
  },
  created: function() {
    //初始化
    //先给cos增加签名方法，因为用不到单次签名所以省略
    cos.getAppSign = (cb) => {
      this.ajax(this.apiUrl + 'user/cossign').then((res) => {
        cb(res.data)
      })
    };
    // cos.getAppSignOnce = (cb) => {
    //   this.ajax(this.apiUrl + 'user/cossign/'+cos.path).then((res) => {
    //     cb(res.data)
    //   })
    // };

    //获取初始信息
    this.ajax(this.apiUrl + 'user/setting/get').then((res) => {
      var content = res.data;
      this.email = content.email;
      this.nickname = content.nickname;
      this.contact = content.contact;
      this.avatarUrl = content.avatarUrl;
      this.username = content.username;
      this.display = true;
    })
  },
  methods: {
    //头像上传成功回调
    avatarChanged: function(cb) {
      //更新头像uri
      this.ajax(this.apiUrl + 'user/useravatarchange/' + this.newavataruri).then((res) => {})
      this.bus.$emit('popMessageComing', '头像已更新', 'ok');
      this.uploadPrevent = true;
      //显示新的头像地址，回调中没有图片bucket地址，自己拼接
      this.avatarUrl = this.imgCdn + '/useravatar/' + this.newavataruri + '/avatar';
      this.$refs.avatarform.reset()
      setTimeout(() => {
        this.uploadPrevent = false;
      }, 5000)
    },
    //cos上传图片方法
    changeAvatar: function(ev) {
      if (this.uploadPrevent) {
        return;
      }
      var file = ev.target.files[0];
      if (file.size > 1572864) {
        return this.bus.$emit('popMessageComing', '尺寸大于1.5mb了...裁剪一下再发', 'warn');
      }
      if (file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/gif') {

      } else {
        return this.bus.$emit('popMessageComing', '格式不对', 'warn');
      }
      if (this.changeAvatar.busy) {
        return;
      }
      this.changeAvatar.busy = true;
      this.newavataruri = this.username + '-' + Date.now();
      cos.uploadFile(
        (cb) => {
          this.changeAvatar.busy = false;
          this.avatarChanged(cb)
        },
        () => {
          this.changeAvatar.busy = false;
          this.bus.$emit('popMessageComing', '失败了...请重试或联系我们', 'warn');
          this.$refs.avatarform.reset()
        },
        () => {
          this.bus.$emit('popMessageComing', '上传ing~', 'ok');
        },
        '900bucket',
        '/useravatar/' + this.newavataruri, file, 1);
    },
    contactModal: function() {
      this.bus.$emit('openmodal', 'message', "settingContact");
    },
    //统一检查输入值长度
    checklength: function(type) {
      switch (type) {
        case 'contact':
        case 'nickname':
          //联系与昵称，只要值不为空就存在，并返回true，type是update传入的
          if (this[type]) {
            return true;
          }
          break;
        case 'pw':
          if (this.oldpw && this.newpw && this.repeatpw) {
            return true;
          }
          break;
      }
      this.bus.$emit('popMessageComing', '填好了再按', 'warn');
    },
    update: function(type) {
      if (!this.checklength(type)) {
        return;
      }
      //如果是密码，检查长度，验证
      if (type == 'pw') {
        if (this.newpw.length < 8) {
          return this.bus.$emit('popMessageComing', '密码太短了，8位以上', 'warn');
        }
        if (this.newpw != this.repeatpw) {
          return this.bus.$emit('popMessageComing', '两次输入的新密码不匹配', 'warn');
        }
        if (this.newpw == this.oldpw) {
          return this.bus.$emit('popMessageComing', '你的新密码和旧密码一样啊....', 'warn');
        }
      }
      //如果验证通过，防止重复点击，加busy判断
      if (this.update.busy) {
        return;
      }
      this.update.busy = true;
      var info = {
        type: type
      };
      var message = '';
      //用于显示popup的message
      //根据type填充info包
      switch (type) {
        case 'contact':
          info.value = this.contact;
          message = '联系方式'
          break;
        case 'nickname':
          info.value = this.nickname;
          message = '昵称'
          break;
        case 'pw':
          info.oldpw = this.oldpw;
          info.newpw = this.newpw;
          message = '密码'
          break;
      }
      //发送包
      this.ajax.post(this.apiUrl + 'user/setting/set/', info).then((res) => {
        switch (res.data) {
          //返回ok代表修改的其他值ok了，pwok代表修改的密码，1.5秒后踢出用户
          case 'ok':
            this.bus.$emit('popMessageComing', message + '已更新', 'ok');
            break;
          case 'pwok':
            this.bus.$emit('popMessageComing', '密码已更新，请重新登录', 'ok');
            setTimeout(() => {
              this.$router.push({
                name: 'logout'
              })
            }, 1500)
            break;
          case 'wrongpw':
            this.bus.$emit('popMessageComing', '输入的旧密码不对', 'warn');
            break;
          default:
            this.bus.$emit('popMessageComing', '保存失败...可能是昵称被占用了', 'warn');
            break;
        }
        this.update.busy = false;
      })

    },
    //修改邮箱
    switchresetemail: function() {
      if (this.switchresetemail.busy) {
        return;
      }
      //发邮件比较耗时，加一个busy判断
      this.switchresetemail.busy = true;
      this.bus.$emit('popMessageComing', '稍等...', 'ok');
      this.ajax.post(this.apiUrl + 'user/resetemail', {
        step: 1
      }).then((res) => {
        if (res.data == 'ok') {
          //发送请求代码邮件，成功后打开重置面板和modal
          this.resetemail = true;
          this.bus.$emit('openmodal', 'message', "resetmail", this.email);
        } else {
          this.bus.$emit('popMessageComing', '系统出错了...请联系我们或刷新', 'warn');
        }
        //解除busy，如果面板已打开，不能返回，所以这里提前解除
        this.switchresetemail.busy = false;
      })
    },
    //确认修改邮箱
    confirmnewmail: function() {
      //验证值都是填好的
      if (!this.newemail || !this.secret || !this.pwtoresetmail) {
        return this.bus.$emit('popMessageComing', '都填好再按', 'warn');
      }
      if (this.email == this.newemail) {
        return this.bus.$emit('popMessageComing', '你的新邮箱和旧的一样啊...', 'warn');
      }
      var info = {
        step: 2,
        pw: this.pwtoresetmail,
        secret: this.secret,
        newmail: this.newemail
      }
      //发送包，交给后端验证
      this.ajax.post(this.apiUrl + 'user/resetemail', info).then((res) => {
        //如果不ok，弹警告，重试
        if (res.data != 'ok') {
          var message = '';
          switch (res.data) {
            case "wrongpw":
              message = '登录密码不对';
              break;
            case "wrongsecret":
              message = '代码不对';
              break;
            case "wrongemail":
              message = '邮箱格式不对...你故意的吗';
              break;
            case "unknown":
              message = '保存失败，这个邮箱已经有人用了啊';
              break;
            default:
              message = '服务出错，请联系我们';
              break;
          }
          this.bus.$emit('popMessageComing', message, 'warn');
        } else {
          //否则删除storage让用户填一遍新邮箱
          //5秒后踢出用户
          window.localStorage.removeItem('account');
          this.bus.$emit('popMessageComing', '邮箱已替换，请使用新邮箱重新登录！', 'ok');
          this.bus.$emit('openmodal', 'message', "mailchanged", this.newemail);
          setTimeout(() => {
            this.$router.push({
              name: 'logout'
            })
          }, 5000)
        }
      })
    }
  }
}
</script>
