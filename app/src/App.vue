<!--
  页面壳：原站六页共用结构（顶部通栏 / logo搜索区 / 红色导航 / 页面主体 / 侧栏 / 页脚）。
  登录态（阶段 5）在壳层初始化一次（原版为各页 ddenglul() 重复四份，重写收敛于此）。
  窄壳页（阶段 5/6）：原版 login/reg.html 无 logo 区、红导航与侧栏，其 nav_top 亦无公告；
  CarCar.html 同样无 logo 区/红导航/侧栏，但保留公告栏（notice）——按三页分级还原。
  购物车数据随登录态联动（阶段 6）：登录后拉取，退出清零。
-->
<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import CategoryNav from './components/CategoryNav.vue'
import SideBar from './components/SideBar.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import TopBar from './components/TopBar.vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

// 登录/注册页：无公告 + 无 logo 区/红导航/侧栏
const isAuthPage = computed(() => route.name === 'login' || route.name === 'reg')
// 窄壳页（含购物车）：无 logo 区/红导航/侧栏
const isNarrowShell = computed(() => ['login', 'reg', 'cart'].includes(String(route.name)))

watch(
  () => auth.me,
  (me) => {
    if (me) void cart.fetchCart()
    else cart.reset()
  },
  { immediate: true },
)

onMounted(() => void auth.fetchMe())
</script>

<template>
  <TopBar :narrow="isAuthPage" />
  <SiteHeader v-if="!isNarrowShell" />
  <CategoryNav v-if="!isNarrowShell" />
  <router-view />
  <SideBar v-if="!isNarrowShell" />
  <SiteFooter />
</template>
