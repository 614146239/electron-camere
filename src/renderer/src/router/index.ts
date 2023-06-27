import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/setting'
  },
  {
    path: '/setting',
    name: 'setting',
    component: () => import('../pages/setting.vue')
  },
  {
    path: '/recording',
    name: 'recording',
    component: () => import('../components/screen.vue')
  },
  {
    path: '/webcam',
    name: 'webcam',
    component: () => import('../components/webcam.vue')
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
