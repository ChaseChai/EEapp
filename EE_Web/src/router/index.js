import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ArticleView from '../views/ArticleView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/article/:id', component: ArticleView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
