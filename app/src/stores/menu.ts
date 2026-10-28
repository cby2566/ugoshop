import { ref } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'
import type { MenuCategory } from '@/types'

export const useMenuStore = defineStore('menu', () => {
  const items = ref<MenuCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMenu() {
    loading.value = true
    error.value = null
    try {
      items.value = await api.menu()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchMenu }
})
