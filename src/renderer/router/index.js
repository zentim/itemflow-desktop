import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: require('@/components/Home').default
    },
    {
      path: '/new',
      name: 'New',
      component: require('@/components/Shared/CreateItemFlow').default
    },
    {
      path: '/favorite',
      name: 'Favorite',
      component: require('@/components/Home').default
    },
    {
      path: '/profile',
      name: 'Profile',
      component: require('@/components/User/Profile').default
    },
    {
      path: '/trash',
      name: 'Trash',
      component: require('@/components/Home').default
    },
    {
      path: '/:id',
      name: 'Itemflow',
      props: true,
      component: require('@/components/Shared/ItemFlow').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
