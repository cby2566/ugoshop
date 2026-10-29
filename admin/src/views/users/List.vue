<script setup lang="ts">
// 占位页（admin 联动批次 1）：批次 3 实装。
// 蓝本：src-one router/user.js（原版 count 返回当前页条数的分页缺陷，
// 重写以真实 count 修正）——列表 / 删除 / 重置密码（scrypt）。
</script>

<template>
  <el-card>
    <template #header><span>用户列表</span></template>
    <el-empty description="批次 3 实装：用户列表 / 删除 / 重置密码" />
  </el-card>
</template>
