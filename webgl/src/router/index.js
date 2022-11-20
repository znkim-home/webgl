import WebGraphicsLibraryView from '@/views/WebGraphicsLibraryView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'WebGraphicsLibraryView',
    component: WebGraphicsLibraryView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
