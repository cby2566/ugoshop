<!--
  注册页主体（原站 reg.html <main> 区原样移植，视觉像素级照搬）。
  与原站的有意差异（逻辑按重写定案做真功能）：
  - 注册提交由原版 GET login.php?fname&psw（明文密码上 URL）改为 POST /api/auth/register，
    密码 scrypt 哈希入库；
  - 唯一性检查保留原版 tel input 的即时 AJAX 行为，等效改 GET /api/auth/check；
  - 验证码：随机 4 位字符 + skewX 变形 + 随机背景/文字色 + 点击刷新，均按原版
    funRoma/skew 行为等效重写；原版 rColor 生成非法色值（fromCharCode(NaN)），
    按设计意图修正为合法随机色；
  - 各项校验失败提示由 alert 改为 toast（T1：替代 ElMessage 的轻量消息）；
  - 其余静态展示位（条款链接、温馨提示、横幅文案）原样保留。
-->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/utils/toast'

import '@/styles/reg.css'
import { api } from '@/api/client'

const router = useRouter()

// —— 表单 ——
const tel = ref('')
const pwd = ref('')
const rpwd = ref('')
const yanz = ref('')
const agreed = ref(true)

// —— 校验状态（对应原版 flag[0..3] 与 ik 图标） ——
const usernameOk = ref(false)
const usernameDup = ref(false)
const pwdOk = ref(false)
const rpwdOk = ref(false)
const codeOk = ref(false)
const showMsg1 = ref(false)
const showMsg2 = ref(false)
const msg1 = ref('请输入常用手机号，避免忘记')

// —— 验证码（原版 funRoma：小写+大写+数字池随机取 4 位） ——
const code = ref('')
const codeStyle = ref<{ background: string; color: string }>({ background: '#f6f6f6', color: '#333' })
const codeSkew = ref('0deg')

function randomCode(): string {
  const pool = [
    String.fromCharCode(97 + Math.floor(Math.random() * 26)),
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    String(Math.floor(Math.random() * 10)),
    String(Math.floor(Math.random() * 10)),
  ]
  return [0, 1, 2, 3].map(() => pool[Math.floor(Math.random() * 4)]).join('')
}

// 原版 rColor 修正版：生成合法随机 hex 色（原实现 fromCharCode(NaN) 产生非法色）
function randomColor(): string {
  return '#' + Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function refreshCode() {
  code.value = randomCode()
  codeStyle.value = { background: randomColor(), color: randomColor() }
  // 原版 skewX：parseInt(Math.random()*-10)+20 → 10~19 度正斜
  codeSkew.value = `${Math.floor(Math.random() * -10) + 20}deg`
  codeOk.value = false
}

// —— 用户名：正则 + 即时唯一性检查（原版 tel input 行为） ——
async function onUsernameInput() {
  showMsg1.value = true
  usernameOk.value = false
  usernameDup.value = false
  if (!tel.value) return
  const res = await api.authCheck(tel.value)
  if (res.available && /^[0-9a-z]{3,11}$/.test(tel.value)) {
    usernameOk.value = true
    msg1.value = '请输入常用手机号，避免忘记'
  } else if (!res.available) {
    usernameDup.value = true
    msg1.value = '用户名重复'
  }
}

function onUsernameBlur() {
  showMsg1.value = false
}

function onPwdInput() {
  showMsg2.value = true
  pwdOk.value = pwd.value.length >= 6
  rpwdOk.value = rpwd.value === pwd.value && pwd.value.length > 0
}

function onRpwdInput() {
  showMsg2.value = true
  rpwdOk.value = rpwd.value === pwd.value && pwd.value.length > 0
}

function onPwdBlur() {
  showMsg2.value = false
}

function onCodeInput() {
  codeOk.value = yanz.value === code.value
}

// —— 提交（原版 .submit：勾选条款 + flag 全过 → 注册 → 跳登录页） ——
async function submit() {
  if (!agreed.value) {
    toast('请先阅读并同意服务承诺')
    return
  }
  if (!usernameOk.value) {
    toast('用户名输入有误')
    return
  }
  if (!pwdOk.value) {
    toast('密码输入有误')
    return
  }
  if (!rpwdOk.value) {
    toast('密码重复输入有误')
    return
  }
  if (!codeOk.value) {
    toast('验证码输入有误')
    return
  }
  try {
    await api.register(tel.value, rpwd.value)
    void router.push('/login')
  } catch (e) {
    toast(e instanceof Error ? e.message : '注册失败')
  }
}

onMounted(refreshCode)
</script>

<template>
  <div class="con">
    <div class="reg_lg">
      <a href="javascript:void(0)"></a>
      <span></span>
      <p>已经注册，<a href="javascript:void(0)" @click.prevent="router.push('/login')">现在登录》</a></p>
    </div>
    <div class="reg_til">
      <div class="reg1 fl">
        <span><i></i>注册/TV激活</span>
      </div>
      <p class="fr">如有疑问请点击<a href="javascript:void(0)">帮助中心</a>，或拨打客服热线：<span>400-707-0707</span></p>
    </div>

    <!-- 内框 -->
    <div class="land">
      <div class="input1 clearfix">
        <div class="input1_l fl">
          <span>用户名：<i class="ik1" :class="{ ik3: usernameOk }" :style="usernameOk ? { top: '8px' } : undefined"></i></span>
          <span>验证码：</span>
          <span>设置密码：<i class="ik2" :class="{ ik3: pwdOk }"></i></span>
          <span>重复密码：<i class="ik2" :class="{ ik3: rpwdOk }"></i></span>
        </div>
        <div class="input1_r fl">
          <input type="text" class="tel" v-model="tel" @input="onUsernameInput" @blur="onUsernameBlur" />
          <input type="text" class="yanz" v-model="yanz" @input="onCodeInput" />
          <span :style="{ background: codeStyle.background, color: codeStyle.color }">
            <a href="javascript:void(0)" @click="refreshCode" :style="{ transform: `skewX(${codeSkew})`, display: 'block' }">{{ code }}</a>
          </span>
          <input type="password" class="pwd" v-model="pwd" @input="onPwdInput" @blur="onPwdBlur" />
          <input type="password" class="r_pwd" v-model="rpwd" @input="onRpwdInput" @blur="onPwdBlur" />
          <div class="i_message">
            <div class="div1" :class="{ div1_1: usernameDup }" :style="{ visibility: showMsg1 ? 'visible' : 'hidden' }">{{ msg1 }}</div>
            <div class="div2" :style="{ visibility: showMsg2 ? 'visible' : 'hidden' }">输入密码，6-20位字符，可使用字母</div>
          </div>
        </div>
      </div>
      <div class="asd">
        <div class="tiaokuan">
          <input type="checkbox" v-model="agreed" />
          <span>我已阅读并同意<a href="javascript:void(0)" class="tiaokuan1">《优品惠用户服务承诺》</a></span>
        </div>
        <div class="submit" @click="submit"></div>
        <div class="login_tips">
          <p>温馨提示：</p>
          优品惠升级为电视购物大全，其中收录了优购物、时尚购物等多家优质购物频道，您可以选购更多优质商品，欢迎您的光临！
        </div>
      </div>
    </div>
  </div>
</template>
