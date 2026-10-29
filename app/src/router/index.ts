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
    // T5：未知路径兜底回首页（避免白屏）
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// I9：页面标题随路由变化（详情页商品名由 ItemView 内覆盖）
const TITLES: Record<string, string> = {
  home: '优品惠 UGOShop',
  list: '商品列表 - 优品惠',
  login: '登录 - 优品惠',
  reg: '注册 - 优品惠',
  cart: '我的购物车 - 优品惠',
}

router.afterEach((to) => {
  document.title = TITLES[String(to.name ?? '')] ?? '优品惠 UGOShop'
})

export default router