// 登入頁面
export const signinRouter = {
  path: '/signin',
  name: 'Signin',
  component: () => import('@/components/User/Signin')
}

// Main
export const appRouter = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/Home')
  },
  {
    path: '/new',
    name: 'New',
    component: () => import('@/components/Shared/CreateItemflow')
  },
  {
    path: '/favorite',
    name: 'Favorite',
    component: () => import('@/components/Home')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/components/User/Profile')
  },
  {
    path: '/trash',
    name: 'Trash',
    component: () => import('@/components/Home')
  },
  {
    path: '/:id',
    name: 'Itemflow',
    props: true,
    component: () => import('@/components/Shared/Itemflow')
  }
]

// 所有上面定義的路由都要寫在下面的 routers 裡
export const routers = [
  signinRouter,
  ...appRouter
]
