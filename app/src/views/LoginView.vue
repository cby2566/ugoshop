<!--
  登录页主体（原站 login.html <main> 区原样移植，视觉像素级照搬）。
  与原站的有意差异（逻辑按重写定案做真功能）：
  - 登录由原版「GET login.php?fname 拿回明文密码、前端比对 + Cookie 直存用户名
    （expires 传当前时刻实际存不住）」改为 POST /api/auth/login 服务端 scrypt
    校验 + HttpOnly 签名会话（原版登录态 bug 由此修正）；
  - 密码错误保持原版 ktips 提示 + 输入框红边行为；输入为空时原版点击无反应，
    此处给出提示；
  - 「记住用户名」「忘记密码」为原站死 UI（无任何 JS），视觉保留、无操作；
  - 其余静态展示位（温馨提示、右侧栏）原样保留。
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const ktips = ref(false)
const shakeBorder = ref(false)

async function login() {
  if (!username.value || !password.value) {
    ElMessage('请输入用户名和密码')
    return
  }
  try {
    await auth.login(username.value, password.value)
    ktips.value = false
    shakeBorder.value = false
    void router.push('/')
  } catch {
    // 原版行为：ktips 显示 + username 输入框红边
    ktips.value = true
    shakeBorder.value = true
  }
}
</script>

<template>
  <div class="con">
    <div class="reg_lg2">
      <a href=""></a>
      <span></span>
    </div>
    <div class="reg_til">
      <p class="fr logti">如有疑问请点击<a href="">帮助中心</a>，或拨打客服热线：<span>400-707-0707</span></p>
    </div>

    <!-- 内框 -->
    <div class="land land2">
      <span>手机号/用户名:</span>
      <div class="d_username">
        <input
          class="username"
          type="text"
          v-model="username"
          :style="shakeBorder ? { border: '1px solid #ffadb0' } : undefined"
        />
        <i class="ik1"></i>
      </div>
      <span>密码:</span>
      <div class="d_log_pws">
        <input class="log_pws" type="password" v-model="password" />
        <i class="ik2"></i>
      </div>
      <div class="ktips" :style="{ display: ktips ? 'block' : 'none' }">您输入的用户名或密码错误，请核对后重新输入！</div>
      <input type="checkbox" /><span>记住用户名</span><a href="" class="wangle">忘记密码？</a>
      <div class="log_sit" @click="login"></div>

      <div class="login_tips">
        <p>温馨提示：</p>
        优品惠升级为电视购物大全，其中收录了优购物、时尚购物等多家优质购物频道，您可以选购更多优质商品，欢迎您的光临！
      </div>
      <div class="feng">
        <div class="land_item3">
          <span>您还不是优品惠的会员？</span>
          <a href="" @click.prevent="router.push('/reg')">免费注册 &gt;</a>
        </div>
        <div class="land_item3">
          <span>电话订购过优品惠商品？</span>
          <a href="javascript:void(0)">快速激活 &gt;</a>
        </div>
      </div>
    </div>
  </div>
</template>
