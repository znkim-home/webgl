import ZnkimView from '@/views/ZnkimView.vue'
import AppView from '@/views/AppView.vue'
import WebGraphicsLibraryView from '@/views/WebGraphicsLibraryView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'WebGraphicsLibraryView',
    component: WebGraphicsLibraryView
  },
  {
    path: '/old',
    name: 'app',
    component: AppView
  },
  {
    path: '/znkim',
    name: 'znkim',
    component: ZnkimView
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
