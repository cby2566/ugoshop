import { ref } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'
import type { CartItem, CartPayload } from '@/api/client'

/**
 * 购物车（阶段 6）。原版各页 ddenglul() 各自 AJAX car.php?flag=y 取 badge 数，
 * 重写收敛为单一 store：列表/条目数一份数据源，顶栏、侧栏、购物车页共享。
 * count 为条目数（与原版 flag=y 返回数组长度语义一致）。
 */
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const count = ref(0)
  const loading = ref(false)

  function apply(payload: CartPayload) {
    items.value = payload.items
    count.value = payload.count
  }

  async function fetchCart() {
    loading.value = true
    try {
      apply(await api.cartList())
    } catch {
      reset()
    } finally {
      loading.value = false
    }
  }

  async function add(sid: number, quantity: number) {
    apply(await api.cartAdd(sid, quantity))
  }

  async function updateQuantity(sid: number, quantity: number) {
    apply(await api.cartUpdate(sid, quantity))
  }

  async function remove(sid: number) {
    apply(await api.cartRemove(sid))
  }

  function reset() {
    items.value = []
    count.value = 0
  }

  return { items, count, loading, fetchCart, add, updateQuantity, remove, reset }
})