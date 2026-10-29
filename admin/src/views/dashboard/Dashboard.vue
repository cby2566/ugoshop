<script setup lang="ts">
import { useAdminAuthStore } from '@/stores/auth'

// 管理端首页占位（admin 联动批次 1）：兼作批次进度看板
const auth = useAdminAuthStore()
</script>

<template>
  <el-card>
    <template #header>
      <span>工作台</span>
    </template>
    <p>你好，{{ auth.username }}。管理端已接入 rebuild 数据库（SQLite · products / users / cart / categories 同源）。</p>
    <el-timeline style="margin-top: 20px">
      <el-timeline-item type="success" timestamp="2026-10-29">
        批次 1 · 骨架：schema 三列（status/stock/role）+ 管理员种子 + 登录闭环 + 管理壳（本页可见）
      </el-timeline-item>
      <el-timeline-item type="primary" timestamp="待实施">
        批次 2 · 核心联动：商品 CRUD + 上下架 + C 端列表 status 过滤（后台下架 → 前台即时不可见）
      </el-timeline-item>
      <el-timeline-item type="primary" timestamp="待实施">
        批次 3 · 其余模块：分类两级管理、用户管理、订单（购物车）查看
      </el-timeline-item>
      <el-timeline-item type="info" timestamp="可延后">
        批次 4 · 收尾：商品图上传、doc 更新、截图存档
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>
