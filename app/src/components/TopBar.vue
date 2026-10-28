<!--
  顶部通栏（原站 homepage.html header#header 原样移植）。
  登录态按原版 ddenglul() 行为接线（阶段 5）：登录后首项显示
  「欢迎尊敬的用户：xxx」、次项变「退出！」并点击退出（原版 Cookie.remove + 跳首页，
  此处走 /api/auth/logout）；未登录保持「注册」「登入」并链至 /reg /login。
-->
<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

defineProps<{ narrow?: boolean }>()

const router = useRouter()
const auth = useAuthStore()

async function doLogout() {
  await auth.logout()
  void router.push('/')
}
</script>

<template>
  <header id="header">
    <nav class="nav_top con">
      <div class="notice" v-if="!narrow">
        <p><i></i>公告</p>
        <p>
          <span>【紧急通知】关于短信发送异常的公告</span>
          <span>【紧急通知】关于短信发送异常的公告</span>
          <span>【紧急通知】关于短信发送异常的公告</span>
          <span>【紧急通知】关于短信发送异常的公告</span>
        </p>
      </div>
      <div style=" flex:1;"></div>
      <ul class="denglu">
        <template v-if="auth.me">
          <li><a class="zhucel" href="javascript:void(0)">欢迎尊敬的用户：{{ auth.me }}</a>|</li>
          <li><a class="denglul" href="javascript:void(0)" @click="doLogout">退出！</a>|</li>
        </template>
        <template v-else>
          <li><a class="zhucel" href="javascript:void(0)" @click="router.push('/reg')">注册</a>|</li>
          <li><a class="denglul" href="javascript:void(0)" @click="router.push('/login')">登入</a>|</li>
        </template>
        <li><a href="javascript:void(0)">我的订单</a>|</li>
        <li><a href="javascript:void(0)">我的关注</a>|</li>
        <li><a href="javascript:void(0)">资讯</a>|</li>
        <li><a href="javascript:void(0)">品牌馆</a>|</li>
        <li><a href="javascript:void(0)"><img src="/museum/css-img/phone.png" width="9" height="12"/>手机优品惠</a></li>
      </ul>
    </nav>
  </header>
</template>
