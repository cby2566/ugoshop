import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/list', name: 'list', component: () => import('@/views/ListView.vue') },
    { path: '/item/:sid', name: 'item', component: () => import('@/views/ItemView.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/reg', name: 'reg', component: () => import('@/views/RegView.vue') },
    { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue') },
  ],
})

export default router