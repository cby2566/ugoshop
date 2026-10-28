import { ref } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'

/**
 * 登录态（阶段 5）。原版为 Cookie 直存用户名（且 expires 传当前时刻实际存不住），
 * 重写为 HttpOnly 签名会话：登录态以 GET /api/auth/me 校验结果为准。
 */
export const useAuthStore = defineStore('auth', () => {
  const me = ref<string | null>(null)
  const loaded = ref(false)

  async function fetchMe() {
    try {
      me.value = (await api.me()).username
    } catch {
      me.value = null
    } finally {
      loaded.value = true
    }
  }

  async function login(username: string, password: string) {
    const res = await api.login(username, password)
    me.value = res.username
  }

  async function register(username: string, password: string) {
    return api.register(username, password)
  }

  async function logout() {
    await api.logout()
    me.value = null
  }

  return { me, loaded, fetchMe, login, register, logout }
})
