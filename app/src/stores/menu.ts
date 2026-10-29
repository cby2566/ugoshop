import { ref } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'
import type { MenuCategory } from '@/types'

export const useMenuStore = defineStore('menu', () => {
  const items = ref<MenuCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  // T4：成功加载后不再重复请求（窄壳页⇄普通页切换时 CategoryNav 重建）
  const loaded = ref(false)

  async function fetchMenu() {
    if (loaded.value) return
    loading.value = true
    error.value = null
    try {
      items.value = await api.menu()
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, loaded, fetchMenu }
})
