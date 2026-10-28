<!--
  页面壳：原站六页共用结构（顶部通栏 / logo搜索区 / 红色导航 / 页面主体 / 侧栏 / 页脚）。
-->
<script setup lang="ts">
import CategoryNav from './components/CategoryNav.vue'
import SideBar from './components/SideBar.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import TopBar from './components/TopBar.vue'
</script>

<template>
  <TopBar />
  <SiteHeader />
  <CategoryNav />
  <router-view />
  <SideBar />
  <SiteFooter />
</template>
