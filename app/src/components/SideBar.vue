<!--
  右下固定侧边栏（原站 .cbl 原样移植）。
  交互 Vue 化对应原 home.js 的 cbl()：hover 显示对应标签、离开隐藏；
  第 4 格点击回顶（原 $(document).scrollTop(0)）。
  第 2 格购物车 badge 与跳转（阶段 6）：数字为条目数（原版 .go_wu_che），点击进 /cart。
  第 3 格（I4）：点击弹出二维码大图浮层（复用页脚 foot_ewm.jpg），
  再次点击/Esc/点空白关闭。
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useCartStore } from '@/stores/cart'

const active = ref(0)
const qrOpen = ref(false)
const router = useRouter()
const cart = useCartStore()

function scrollToTop() {
  document.documentElement.scrollTop = 0
}

function goCart() {
  void router.push('/cart')
}

function toggleQr() {
  qrOpen.value = !qrOpen.value
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') qrOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
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
      <div data-ce="3" @mouseenter="active = 3" @click="toggleQr"></div>
      <div data-ce="4" @mouseenter="active = 4" @click="scrollToTop"></div>
    </div>
    <!-- I4：二维码弹层（点击空白/Esc/再次点击关闭） -->
    <div v-if="qrOpen" class="ugoshop-qr-mask" @click="qrOpen = false">
      <div class="ugoshop-qr-panel" @click.stop>
        <img src="/museum/img/foot_ewm.jpg" width="150" height="150" alt="优品惠二维码" />
        <p>手机优品惠（优购物）</p>
        <span>扫码关注，新品特惠早知道</span>
      </div>
    </div>
  </div>
</template>

<style>
/* I4：二维码弹层（半透明遮罩 + 白底卡片） */
.ugoshop-qr-mask {
  position: fixed;
  inset: 0;
  z-index: 9500;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ugoshop-qr-panel {
  background: #fff;
  border-radius: 6px;
  padding: 20px 24px;
  text-align: center;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
}
.ugoshop-qr-panel img {
  display: block;
  margin: 0 auto 10px;
}
.ugoshop-qr-panel p {
  margin: 0 0 4px;
  font-size: 14px;
  color: #333;
  font-weight: 700;
}
.ugoshop-qr-panel span {
  font-size: 12px;
  color: #999;
}
</style>