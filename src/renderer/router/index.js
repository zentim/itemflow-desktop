import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: require('@/pages/Home').default
    },
    {
      path: '/new',
      name: 'New',
      component: require('@/pages/CreateItemFlow').default
    },
    {
      path: '/favorite',
      name: 'Favorite',
      component: require('@/pages/Home').default
    },
    {
      path: '/profile',
      name: 'Profile',
      component: require('@/pages/Profile').default
    },
    {
      path: '/trash',
      name: 'Trash',
      component: require('@/pages/Home').default
    },
    {
      path: '/:id',
      name: 'Itemflow',
      props: true,
      component: require('@/pages/ItemFlow').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
