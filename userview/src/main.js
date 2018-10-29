import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import App from './App.vue'
import axios from 'axios'
import infiniteScroll from 'vue-infinite-scroll'
require('lie/polyfill');
//设置自定挂载属性
const apiUrl = '/api/';
Vue.prototype.apiUrl = apiUrl;
Vue.prototype.imgCdn = 'https://img.nine00.com';
axios.defaults.withCredentials = true;
Vue.prototype.ajax = axios;
Vue.prototype.bus = new Vue();
//注册全局组件
import popup from './component/popup.vue'
import backdrop from './component/backdrop.vue'
Vue.component('popup', popup);
Vue.component('backdrop', backdrop);

//插件
Vue.use(infiniteScroll);


//路由初始化
Vue.use(VueRouter)
const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    return {
      x: 0,
      y: 0
    }
  }
})

Vue.prototype.reject = (res) => {
  if (res.data == 'reject') {
    router.replace({
      query: { notfound: '1' },
      name: 'notfound'
    })
    return true;
  } else {
    return false
  }
}

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  switch (to.name) {
    case "signin":
    case "signup":
      axios(apiUrl + 'user/loginstatus').then((res) => {
        if (res.data == 'letgo') {
          next({
            name: 'userposts'
          })
        } else {
          next()
        }
      });
      break;
    case "userposts":
    case "bm":
    case "addpost":
    case "settings":
    case "editpost":
      axios(apiUrl + 'user/loginstatus').then((res) => {
        if (res.data == 'letgo') {
          next()
        } else {
          next({
            name: 'signin'
          })
        }
      });
      break;
    case 'logout':
      axios(apiUrl + 'user/logout').then((res) => {
        if (res.data == 'logout') {
          Vue.prototype.bus.$emit('popMessageComing', '已经注销', 'ok');
          next({
            name: 'index'
          })
        } else {
          Vue.prototype.bus.$emit('popMessageComing', '注销失败，请联系管理员或重试', 'warn');
          next(false);
        }
      });
      break;
    default:
      next();
      break;
  }

})

Vue.directive('title', {
  bind: function(el, binding) {
    document.title = el.dataset.title
  }
})


//根实例
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
