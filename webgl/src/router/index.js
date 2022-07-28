import ZnkimView from '@/views/ZnkimView.vue'
import AppView from '@/views/AppView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'znkim',
    component: ZnkimView
  },
  {
    path: '/old',
    name: 'app',
    component: AppView
  },
  /*{
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // webpackChunkName: "about"
    component: () => import('../views/AboutView.vue')
  }*/
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
