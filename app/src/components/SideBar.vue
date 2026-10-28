<!--
  右下固定侧边栏（原站 .cbl 原样移植）。
  交互 Vue 化对应原 home.js 的 cbl()：hover 显示对应标签、离开隐藏；
  第 4 格点击回顶（原 $(document).scrollTop(0)）。
  第 2 格购物车 badge 与跳转（阶段 6）：数字为条目数（原版 .go_wu_che），点击进 /cart。
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useCartStore } from '@/stores/cart'

const active = ref(0)
const router = useRouter()
const cart = useCartStore()

function scrollToTop() {
  document.documentElement.scrollTop = 0
}

function goCart() {
  void router.push('/cart')
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
      <div data-ce="2" @mouseenter="active = 2" @click="goCart">
        <a class="go_wu_che">{{ cart.count }}</a>
      </div>
      <div data-ce="3" @mouseenter="active = 3"></div>
      <div data-ce="4" @mouseenter="active = 4" @click="scrollToTop"></div>
    </div>
  </div>
</template>
