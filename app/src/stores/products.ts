import { ref } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'
import type { Product } from '@/types'

export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      items.value = await api.products()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchProducts }
})
