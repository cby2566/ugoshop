<script setup lang="ts">
// 占位页（admin 联动批次 1）：批次 3 实装。
// 蓝本：src-one router/goods.js /goods/classify(+add/amend)（扁平一级）——
// 重写为 categories + category_items 两级管理，对齐前台两级菜单结构。
</script>

<template>
  <el-card>
    <template #header><span>商品分类</span></template>
    <el-empty description="批次 3 实装：两级分类管理（categories + category_items）" />
  </el-card>
</template>
