import { createRouter, createWebHistory } from 'vue-router'

import CartView from '@/views/CartView.vue'
import HomeView from '@/views/HomeView.vue'
import ItemView from '@/views/ItemView.vue'
import ListView from '@/views/ListView.vue'
import LoginView from '@/views/LoginView.vue'
import RegView from '@/views/RegView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/list', name: 'list', component: ListView },
    { path: '/item/:sid', name: 'item', component: ItemView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/reg', name: 'reg', component: RegView },
    { path: '/cart', name: 'cart', component: CartView },
  ],
})

export default router