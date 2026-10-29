<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAdminAuthStore } from '@/stores/auth'

/**
 * 管理端主布局（admin 联动批次 1）。
 * 菜单树原样取自 2018 老后台（src-one lay/html/index.html 左侧 layui-nav）：
 * 商品管理[商品列表/商品分类]、用户管理[用户列表]、订单管理[订单列表]；
 * 深色侧边栏致敬老后台 layui-bg-black。退出即清 admin_session 会话。
 */
const route = useRoute()
const router = useRouter()
const auth = useAdminAuthStore()

const activeMenu = computed(() => route.path)

async function onLogout() {
  await auth.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <el-container class="admin-shell">
    <el-aside width="220px" class="admin-aside">
      <div class="admin-logo">优品惠后台</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="rgba(255, 255, 255, 0.68)"
        active-text-color="#409eff"
      >
        <el-sub-menu index="goods">
          <template #title>商品管理</template>
          <el-menu-item index="/products">商品列表</el-menu-item>
          <el-menu-item index="/categories">商品分类</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="user">
          <template #title>用户管理</template>
          <el-menu-item index="/users">用户列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="order">
          <template #title>订单管理</template>
          <el-menu-item index="/orders">订单列表</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <span class="admin-header-title">xxx后台管理系统</span>
        <span class="admin-header-right">
          <span class="admin-user">{{ auth.username }}</span>
          <el-button text type="danger" @click="onLogout">退了</el-button>
        </span>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
}

/* 深色侧边栏：致敬 2018 老后台 layui-bg-black */
.admin-aside {
  background: #001529;
}

.admin-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

.admin-header-title {
  font-weight: 600;
  color: #303133;
}

.admin-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-user {
  color: #606266;
  font-size: 14px;
}

.admin-main {
  background: #f5f7fa;
}
</style>
