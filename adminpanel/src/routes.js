import login from './component/login.vue'
import main from './component/main.vue'
import dashboard from './component/dashboard.vue'
import posts from './component/posts.vue'
import tags from './component/tags.vue'
import comments from './component/comments.vue'
import users from './component/users.vue'
import global from './component/global.vue'
import editpost from './component/editpost.vue'
import collect from './component/collect.vue'
import editcollect from './component/editcollect.vue'

const routers = [{
    path: '/login',
    name: 'login',
    component: login
  }, {
    path: '/',
    component: main,
    children: [{
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: dashboard
      }, {
        path: '/tags',
        name:'tags',
        component: tags
      }, {
        path: '/comments',
        name:'comments',
        component: comments
      },
      {
        path: '/posts',
        name:'posts',
        component: posts
      },
      {
        path: '/users',
        name:'users',
        component: users
      }, {
        path: '/global',
        name:'global',
        component: global
      },
      {
        path: '/logout',
        name: 'logout'
      },
      {
        path: '/editpost/:id',
        name: 'editpost',
        component:editpost
      },
      {
        path: '/collect',
        name: 'collect',
        component:collect
      },
      {
        path: '/editcollect/:slug',
        name: 'editcollect',
        component:editcollect
      }
    ]
  }

]

export default routers
