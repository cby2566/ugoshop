<script setup lang="ts">
// 占位页（admin 联动批次 1）：批次 3 实装。
// 蓝本：src-one router/car.js + carcar.js——"订单管理"读 car 表，
// 2018 年购物车即订单的历史语义原样保留（菜单名不改动）；
// 重写数据源为 cart 表（fid→user_id / sid / sum→quantity）。
</script>

<template>
  <el-card>
    <template #header><span>订单列表</span></template>
    <el-empty description="批次 3 实装：订单（购物车）记录查看——沿用 2018 年 car 即订单的原始语义" />
  </el-card>
</template>
