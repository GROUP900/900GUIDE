import show from './component/show.vue'
import post from './component/post.vue'
import index from './component/index.vue'
import notfound from './component/notfound.vue';
import account from './component/account.vue';
import list from './component/list.vue';
import signin from './component/signin.vue';
import signup from './component/signup.vue';
import user from './component/user.vue';
import userposts from './component/userposts.vue';
import bm from './component/bm.vue';
import settings from './component/settings.vue';
import editpost from './component/editpost.vue';
import userpage from './component/userpage.vue';
import collection from './component/collection.vue';

var sitename = ' | 900指南';

const routers = [{
    path: '/',
    component: index,
    name: 'index',
    meta: {
      title: "首页" + sitename
    }
  },
  {
    path: '/u/:username',
    component: userpage,
    name: 'userpage',
    meta: {
      title: "用户" + sitename
    }
  },
  {
    path: '/collection/:slug',
    component: collection,
    name: 'collection',
    meta: {
      title: "特辑" + sitename
    }
  },
  {
    path: '/show',
    component: show,
    children: [{
      path: 'post/:id',
      component: post,
      name: 'post',
      meta: {
        title: "加载中" + sitename
      }
    }, {
      path: 'list/:type/:param/:page',
      component: list,
      name: 'list',
      meta: {
        title: "结果" + sitename
      }
    }]
  }, {
    path: '/account',
    component: account,
    children: [{
        path: '/',
        redirect: {
          name: 'signin'
        }
      },
      {
        path: 'signin',
        component: signin,
        name: 'signin',
        meta: {
          title: "登录" + sitename
        }
      }, {
        path: 'signup',
        component: signup,
        name: 'signup',
        meta: {
          title: "注册" + sitename
        }
      }
    ]
  },
  {
    path: '/user',
    component: user,
    redirect: {
      name: 'userposts'
    },
    children: [{
        path: 'logout',
        name: 'logout'
      },
      {
        path: 'userposts',
        name: 'userposts',
        component: userposts,
        meta: {
          title: "你的投稿" + sitename
        }
      },
      {
        path: 'addpost',
        name: 'addpost',
        component: editpost,
        meta: {
          title: "添加文章" + sitename
        }
      },
      {
        path: 'editpost/:id',
        name: 'editpost',
        component: editpost,
        meta: {
          title: "编辑文章" + sitename
        }
      },
      {
        path: 'bm',
        name: 'bm',
        component: bm,
        meta: {
          title: "你的收藏" + sitename
        }
      },
      {
        path: 'settings',
        name: 'settings',
        component: settings,
        meta: {
          title: "设置" + sitename
        }
      }
    ]
  },
  {
  path: '*',
  component: notfound,
  name:'notfound',
  meta: {
    title: "页面未找到" + sitename
  }
}
]

export default routers
