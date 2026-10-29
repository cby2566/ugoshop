import { createRouter, createWebHistory } from 'vue-router'

import { useAdminAuthStore } from '@/stores/auth'

import AdminLayout from '@/layouts/AdminLayout.vue'
import LoginView from '@/views/login/Login.vue'
import DashboardView from '@/views/dashboard/Dashboard.vue'
import ProductListView from '@/views/products/List.vue'
import CategoryIndexView from '@/views/categories/Index.vue'
import UserListView from '@/views/users/List.vue'
import OrderListView from '@/views/orders/List.vue'

/**
 * 管理端路由（admin 联动批次 1）。
 * 菜单树对齐 2018 老后台（src-one lay/html/index.html 左侧导航）：
 * 商品管理[列表/分类] / 用户管理[列表] / 订单管理[列表]——皮换新、骨架原样。
 * 批次 1 各业务页为占位，批次 2（商品）/批次 3（分类/用户/订单）逐页实装。
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    {
      path: '/',
      component: AdminLayout,
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: DashboardView },
        { path: 'products', name: 'products', component: ProductListView },
        { path: 'categories', name: 'categories', component: CategoryIndexView },
        { path: 'users', name: 'users', component: UserListView },
        { path: 'orders', name: 'orders', component: OrderListView },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// 全局前置守卫：非 public 路由要求管理端会话（401 → 登录页）
router.beforeEach(async (to) => {
  const auth = useAdminAuthStore()
  if (to.meta.public) {
    return true
  }
  if (!auth.checked) {
    await auth.restore()
  }
  if (!auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
