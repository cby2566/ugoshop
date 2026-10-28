<!--
  页面壳：原站六页共用结构（顶部通栏 / logo搜索区 / 红色导航 / 页面主体 / 侧栏 / 页脚）。
  登录态（阶段 5）在壳层初始化一次（原版为各页 ddenglul() 重复四份，重写收敛于此）。
  登录/注册页按原版走窄页头（原版 login/reg.html 无 logo 区、无红导航、无侧栏）。
-->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import CategoryNav from './components/CategoryNav.vue'
import SideBar from './components/SideBar.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import TopBar from './components/TopBar.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const auth = useAuthStore()

// 原版 login/reg 页顶部仅一条公告通栏（nav_top），无 logo 区、红导航与侧栏
const isAuthPage = computed(() => route.name === 'login' || route.name === 'reg')

onMounted(() => void auth.fetchMe())
</script>

<template>
  <TopBar :narrow="isAuthPage" />
  <SiteHeader v-if="!isAuthPage" />
  <CategoryNav v-if="!isAuthPage" />
  <router-view />
  <SideBar v-if="!isAuthPage" />
  <SiteFooter />
</template>
