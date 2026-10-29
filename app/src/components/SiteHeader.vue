<!--
  logo / 搜索 / 购物车区（原站 #header_logo 原样移植）。
  购物车入口与 badge 接线（阶段 6）：badge 显示条目数（原版 .mycart span，
  数据源为 car.php?flag=y 数组长度，重写收敛到 cart store），点击进 /cart。
  logo 接线（收尾）：点击归首页（原版无链接，纯行为增强、视觉不变）。
  搜索框接线（I2）：v-model + 回车/按钮 → /list?q=xxx；空关键词不触发。
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cart = useCartStore()
const keyword = ref('')

function goCart() {
  void router.push('/cart')
}

function goHome() {
  void router.push('/')
}

function search() {
  const kw = keyword.value.trim()
  if (!kw) return
  void router.push({ path: '/list', query: { q: kw } })
}
</script>

<template>
  <article id="header_logo">
    <article class="header_logo con">
      <div class="lbox">
        <img src="/museum/css-img/logo.png" height="46" width="206" alt="" @click="goHome" />
        <img src="/museum/css-img/logom.jpg" height="30" width="206" alt="" @click="goHome" />
      </div>
      <div class="lsearch fl">
        <div class="sch">
          <input type="text" class="schin" v-model="keyword" @keyup.enter="search" />
          <a href="javascript:void(0)" @click="search"></a>
        </div>
      </div>
      <div class="mycart fr" @click="goCart">
        <img src="/museum/css-img/gwc.png" height="18" width="19" alt="" />
        <a href="javascript:void(0)">我的购物车</a>
        <span>{{ cart.count }}</span>
        <i></i>
      </div>
    </article>
  </article>
</template>