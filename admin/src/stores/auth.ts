import { defineStore } from 'pinia'

import { api } from '@/api/client'

/**
 * 管理端登录态（admin 联动批次 1）。
 * 原版对照：src-one（2018）登录页明文比对后 Cookie.set('username')，未签名可伪造；
 * 重写以 HttpOnly 签名 cookie 会话为准，前端 store 仅作导航态缓存，
 * 权威校验始终在 server（guard.ts 每次实时核 role）。
 */
export const useAdminAuthStore = defineStore('admin-auth', {
  state: () => ({
    username: '' as string,
    /** 是否已尝试从会话恢复（恢复过才允许路由守卫放行） */
    checked: false,
  }),
  getters: {
    isLoggedIn: (state) => state.username !== '',
  },
  actions: {
    /** 从 admin_session 会话恢复登录态（应用启动/守卫首次触发时调用） */
    async restore() {
      try {
        const { username } = await api.adminMe()
        this.username = username
      } catch {
        this.username = ''
      } finally {
        this.checked = true
      }
    },
    async login(username: string, password: string) {
      const res = await api.adminLogin(username, password)
      this.username = res.username
      this.checked = true
    },
    async logout() {
      try {
        await api.adminLogout()
      } finally {
        this.username = ''
      }
    },
  },
})
