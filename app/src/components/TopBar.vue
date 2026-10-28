<!--
  顶部通栏（原站 homepage.html header#header 原样移植）。
  登录态按原版 ddenglul() 行为接线（阶段 5）：登录后首项显示
  「欢迎尊敬的用户：xxx」、次项变「退出！」并点击退出（原版 Cookie.remove + 跳首页，
  此处走 /api/auth/logout）；未登录保持「注册」「登入」并链至 /reg /login。
  公告为垂直滚动（有意差异，见文末 style 注释）：原站 home.js 的 gongg() 
  对 .notice ul 做 jQuery animate 上下滚动，但 ul 结构自始被 HTML 注释、
  JS 从未生效，故按该设计意图以纯 CSS 等效还原。
-->
<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

defineProps<{ narrow?: boolean }>()

const router = useRouter()
const auth = useAuthStore()

// 原站硬编码的 4 条公告文案（原样保留）；渲染时拼接两份实现无缝循环滚动
const notices = [
  '【紧急通知】关于短信发送异常的公告',
  '【紧急通知】关于短信发送异常的公告',
  '【紧急通知】关于短信发送异常的公告',
  '【紧急通知】关于短信发送异常的公告',
]
const noticeLoop = [...notices, ...notices]

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
          <span class="notice-roll">
            <span
              v-for="(text, i) in noticeLoop"
              :key="i"
              :aria-hidden="i >= notices.length ? 'true' : undefined"
            >{{ text }}</span>
          </span>
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

<style>
/*
  rebuild 增补（有意差异）：2018 原站 CSS 从未定义 .notice/.denglu 的任何样式，
  1000px 版心里 notice 按内容宽度占据 ~692px，把 ul.denglu 挤到 min-content、
  链接逐字换行成竖排，公告第二个 p 还下坠溢出到 logo 区（原站在任何视口下均如此，
  属上线遗留缺陷，museum 实机可复现）。此处按原站设计意图补全：
  - 公告区：「公告」标签 + 单行高滚动窗口，条目逐条上滚、带停留、无缝循环
    （原站 home.js 的 gongg() 即此意图：对 .notice ul 上下 animate，
    但 ul 自始被注释、从未生效，故以纯 CSS animation 等效还原。
    两层结构：p:last-child 为固定窗口（overflow:hidden），
    内层 .notice-roll 承载动画 translateY——transform 必须作用于内容层，
    若作用于窗口自身会把裁剪区一并移走导致整个公告区空白；
    内容渲染两份拼接，末份仅作回绕、aria-hidden 不重复朗读）
  - 链接禁止换行（flex item 的 min-width:auto 随之保护 ul 不再被压缩换行）
*/
.nav_top .notice {
  display: flex;
  align-items: center;
  overflow: hidden;
}
.nav_top .notice p:first-child {
  margin-right: 8px;
  white-space: nowrap;
}
.nav_top .notice p:last-child {
  height: 28px;
  overflow: hidden;
  white-space: nowrap;
}
.nav_top .notice .notice-roll {
  display: block;
  animation: ugoshop-notice-scroll 12s linear infinite;
}
.nav_top .notice .notice-roll span {
  display: block;
  line-height: 28px;
}
@keyframes ugoshop-notice-scroll {
  0%, 20% { transform: translateY(0); }
  25%, 45% { transform: translateY(-28px); }
  50%, 70% { transform: translateY(-56px); }
  75%, 95% { transform: translateY(-84px); }
  100% { transform: translateY(-112px); }
}
@media (prefers-reduced-motion: reduce) {
  .nav_top .notice .notice-roll {
    animation: none;
  }
}
.nav_top ul li a {
  white-space: nowrap;
}
</style>
