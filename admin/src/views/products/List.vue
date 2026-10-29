<script setup lang="ts">
// 占位页（admin 联动批次 1）：批次 2 实装。
// 蓝本：src-one router/goods.js GET /goods（LayUI 表格分页）——
// 重写为 GET /api/admin/products + Element Plus 表格，含上下架开关与编辑对话框。
</script>

<template>
  <el-card>
    <template #header><span>商品列表</span></template>
    <el-empty description="批次 2 实装：商品 CRUD + 上下架（后台下架 → 前台列表即时不可见）" />
  </el-card>
</template>
