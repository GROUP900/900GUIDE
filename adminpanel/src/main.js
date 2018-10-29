import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import App from './App.vue'
import axios from 'axios'
axios.defaults.withCredentials = true;
//设置自定挂载属性
const apiUrl = '/supanel/api/';
Vue.prototype.apiUrl = apiUrl;
Vue.prototype.imgCdn = 'http://img.nine00.com';
Vue.prototype.bucketUrl = 'http://files.nine00.com';
Vue.prototype.frontUrl = 'http://localhost:8080/';
Vue.prototype.ajax = axios;
Vue.prototype.bus = new Vue();
//注册全局组件
import popup from './component/popup.vue'
import suheader from './component/header.vue'

Vue.component('popup', popup);
Vue.component('suheader', suheader);

//路由初始化
Vue.use(VueRouter)
const router = new VueRouter({
  mode: 'history',
  routes
})
//全局路由钩子
router.beforeEach((to, from, next) => {
  switch (to.name) {
    case "login":
      next();
      break;
    case "logout":
      Vue.prototype.bus.$emit('popMessageComing', 'logout');
      axios(apiUrl + 'su/logout').then((res) => {
        if (res.data == 'logout') {
          next({
            name: 'login'
          });
        }
      });
      break;
    default:
      axios(apiUrl + 'su/loginstatus')
        .then(function(res) {
          if (res.data == 'letgo') {
            next()
          } else {
            next({
              name: 'login'
            })
          }
          return;
        })
      next(false)
  }

})

//根实例
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
