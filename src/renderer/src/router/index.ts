import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/setting'
  },
  {
    path: '/setting',
    name: 'setting',
    component: () => import('../pages/setting.vue'),
    children: [
      {
        path: '/setting',
        redirect: '/webcamSetting'
      },
      {
        path: '/webcamSetting',
        name: 'webcamSetting',
        component: () => import('../pages/webcamSetting.vue')
      },
      {
        path: '/faceModel',
        name: 'faceModel',
        component: () => import('../pages/faceModel.vue')
      },
      {
        path: '/backgroundCut',
        name: 'backgroundCut',
        component: () => import('../pages/backgroundCut.vue')
      }
    ]
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
  },
  {
    path: '/countDown',
    name: 'countDown',
    component: () => import('../pages/countDown.vue')
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
