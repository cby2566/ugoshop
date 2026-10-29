<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAdminAuthStore } from '@/stores/auth'

/**
 * 管理端登录页（admin 联动批次 1）。
 * 视觉致敬 2018 老后台（src-one src/index.html）：蓝色整屏底 + 白色登录卡片 +
 * 标题"后台管理系统"——不做像素复刻，取其气质。
 * 原版对照：图形验证码（idcode，纯前端校验）与"记住我"明文 cookie 不沿用，
 * 登录态交由 server scrypt + HttpOnly 签名会话（见 server/src/routes/admin/auth.ts）。
 */
const router = useRouter()
const route = useRoute()
const auth = useAdminAuthStore()

const form = reactive({ username: '', password: '' })
const loading = ref(false)

async function onSubmit() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名与密码')
    return
  }
  loading.value = true
  try {
    await auth.login(form.username, form.password)
    ElMessage.success(`欢迎回来，${auth.username}`)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-screen">
    <div class="login-card">
      <div class="login-title">
        <h1>后台管理系统</h1>
        <p>优品惠 UGOShop · admin</p>
      </div>
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="用户名">
          <el-input
            v-model="form.username"
            placeholder="管理员账号"
            autocomplete="username"
            :prefix-icon="undefined"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            show-password
            autocomplete="current-password"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button
          class="login-btn"
          type="primary"
          native-type="submit"
          :loading="loading"
          @click.prevent="onSubmit"
        >
          登入
        </el-button>
      </el-form>
      <p class="login-footnote">蓝本：src-one（2018）· 账号由种子脚本创建（server/scripts/seed.ts）</p>
    </div>
  </div>
</template>

<style scoped>
/* 蓝白致敬配色：取 2018 老后台整屏蓝底气质 */
.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #1e9fff 0%, #16baaa 100%);
}

.login-card {
  width: 360px;
  padding: 36px 40px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 21, 41, 0.25);
}

.login-title {
  text-align: center;
  margin-bottom: 24px;
}

.login-title h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
  letter-spacing: 4px;
}

.login-title p {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}

.login-footnote {
  margin: 16px 0 0;
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
}
</style>
