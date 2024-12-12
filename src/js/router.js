import { createRouter, createWebHistory } from 'vue-router'

import Home from './pages/Home.vue'
import Settings from './pages/Settings.vue'
// Define your routes
const routes = [
  { path: '/', component: Home },
  { path: '/settings', component: Settings}
]

const router = createRouter({
  history: createWebHistory(),  // Use HTML5 history mode
  routes,  // Your defined routes
})

export default router
