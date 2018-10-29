

<template>
<transition name="fade">
<div v-if="display" v-title :data-title="content.title+' | 900指南'">
    <modal></modal>
    <div v-if='previewmode' class="previewwarn">文章还未经过审核，你正在预览模式下查看文章</div>
    <article class="post">
        <div class="media" v-if="type=='post'">
            <img :src="getheaderpic()">
        </div>
        <div class="media video" v-if="type=='video'" v-html='content.resource'>
        </div>
        <div class="media audio" v-if="type=='audio'">
            <img :src="getheaderpic()">
            <div v-html='content.resource'>
            </div>
        </div>
        <router-link :to="{ name: 'userpage', params: { username: content.authorusername}}">
            <p class="author"><img :src="content.authoravatar"><span>{{content.authornickname}}</span></p>
        </router-link>
        <h2 v-text="content.title"></h2>
        <p class="excerpt" v-text="content.excerpt"></p>
        <div class="content" v-html="content.content">
        </div>
        <div class="note">
            <p>
                <router-link :to="{ name: 'userpage', params: { username: content.authorusername}}">{{content.authornickname}}</router-link> 投稿于 {{content.dispdate}}</p>
        </div>
    </article>

    <section v-if='!previewmode' class="postbottom">
        <div class="utils">
            <div class="tag" @click="showTag"></div>
            <div class="wechat hidden-mobi" @click="showQr"></div>
            <a :href="wbshareurl" target="_blank">
                <div class="weibo"></div>
            </a>
            <div @click="addBm" class="star" :class="{ added: bmAdded }"></div>
        </div>
        <commentbox :loginuser="content.loginuser" :postid="content._id"></commentbox>
        <comments :postid="content._id"></comments>
        <r class='hidden-mobi' :tags="content.tags" :title='content.title'></r>
        <wxqr class='hidden-dt'></wxqr>
        <router-link :to="{ name: 'index'}">
            <div class="bottomicon"></div>
        </router-link>
    </section>
</div>
</transition>
</template>

<script>

import commentbox from './commentbox.vue'
import comments from './comments.vue'
import modal from './modal.vue'
import r from './relatedpost.vue'
import wxqr from './wxqr.vue'
import imglazy from 'vanilla-lazyload'
export default {
    name: 'post',
    data() {
        return {
            content: {},
            display: false,
            postQr: '',
            bmAdded: false,
            login: false,
            type: '',
            related: [],
            wbshareurl:''
        }
    },
    components: {
        'modal': modal,
        'commentbox': commentbox,
        'comments': comments,
        'r': r,
        'wxqr': wxqr
    },
    computed: {
        previewmode: function() {
            if (this.content.status.type != 'showing') {
                return true;
            } else {
                return false;
            }
        }
    },
    created: function() {
        this.ajax(this.apiUrl + 'show/post/' + this.$route.params.id).then((res) => {
            if (this.reject(res)) {
                return
            }
            this.content = res.data;
            this.type = this.content.type;
            if (this.content.loginuser) {
                this.login = true;
                if (this.content.loginuser.bmAdded != -1) {
                    this.bmAdded = true;
                }
            }
            this.wbshareurl = 'http://service.weibo.com/share/share.php?appkey=1444895989&title='+encodeURIComponent(this.content.title+'-900指南')+'&url='+encodeURIComponent(window.location.href.replace("/show/","/r/").replace("https://","http://"))+'&searchPic=true';
            this.display = true;
            setTimeout(function() {
                new imglazy();
            }, 0)
        })
    },
    methods: {
        getheaderpic: function() {
            if (!this.content.headerpic) {
                return this.imgCdn + '/util/placeholder.jpg/headerpic';
            } else {
                return this.content.dispheaderpic;
            }
        },
        addBm: function() {
            if (!this.login) {
                this.bus.$emit('openmodal', 'message', "bmNeedsignin");
                return;
            }
            if (this.addBm.busy) {
                return;
            }
            this.addBm.busy = true;
            if (!this.bmAdded) {
                this.ajax(this.apiUrl + 'show/bm/add/' + this.$route.params.id).then((res) => {
                    if (res.data == 'ok') {
                        this.bus.$emit('popMessageComing', '已加入到你的收藏', 'ok');
                        this.bmAdded = true;
                    }
                    this.addBm.busy = false;
                })
            } else {
                this.ajax(this.apiUrl + 'show/bm/remove/' + this.$route.params.id).then((res) => {
                    if (res.data == 'ok') {
                        this.bus.$emit('popMessageComing', '已取消收藏', 'ok');
                        this.bmAdded = false;
                    } else {
                        this.bus.$emit('popMessageComing', '取消收藏失败', 'warn');
                    }
                    this.addBm.busy = false;
                })
            }
        },
        showTag: function() {
            this.bus.$emit('openmodal', 'tag', this.content.tags);
        },
        showQr: function() {
            if (this.postQr == "") {
                this.ajax.post(this.apiUrl + 'show/getqr', {
                    url: window.location.href
                }).then((res) => {
                    this.postQr = res.data;
                    this.bus.$emit('openmodal', 'qr', this.postQr);
                    return;
                })
            }
            this.bus.$emit('openmodal', 'qr', this.postQr);
        }
    }
}

</script>
