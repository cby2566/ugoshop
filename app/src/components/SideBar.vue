<!--
  右下固定侧边栏（原站 .cbl 原样移植）。
  交互 Vue 化对应原 home.js 的 cbl()：hover 显示对应标签、离开隐藏；
  第 4 格点击回顶（原 $(document).scrollTop(0)）。
  第 2 格购物车点击跳转暂缺（阶段 3 建 CarCar 页后接路由）。
-->
<script setup lang="ts">
import { ref } from 'vue'

const active = ref(0)

function scrollToTop() {
  document.documentElement.scrollTop = 0
}
</script>

<template>
  <div class="cbl">
    <div class="zuo">
      <div :style="{ visibility: active === 1 ? 'visible' : 'hidden' }">用户中心</div>
      <div :style="{ visibility: active === 2 ? 'visible' : 'hidden' }">购物车</div>
      <div :style="{ visibility: active === 3 ? 'visible' : 'hidden' }">二维码</div>
      <div :style="{ visibility: active === 4 ? 'visible' : 'hidden' }">向上</div>
    </div>
    <div class="you" @mouseleave="active = 0">
      <div data-ce="1" @mouseenter="active = 1"></div>
      <div data-ce="2" @mouseenter="active = 2">
        <a class="go_wu_che">0</a>
      </div>
      <div data-ce="3" @mouseenter="active = 3"></div>
      <div data-ce="4" @mouseenter="active = 4" @click="scrollToTop"></div>
    </div>
  </div>
</template>
