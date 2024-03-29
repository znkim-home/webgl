import MainView from '@/views/MainView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'MainView',
    component: MainView
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})
export default router
