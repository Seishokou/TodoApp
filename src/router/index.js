import { createRouter, createWebHistory } from 'vue-router'
import TodoApp from '../components/TodoApp.vue'
import AboutView from '../views/AboutView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: TodoApp,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router