import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'
import type { Product } from '@/types'

/**
 * 商品列表（列表页）。原站 footList.js 的数据加载/分页为死代码，museum 纪念版
 * 由 mock-api.js 代为激活；此处重写为真分页与真排序，交互与 museum 实际呈现一致：
 * 价格两态 toggle（升↔降），其他查找项恢复默认序（等效原站点击无实际效果）。
 */
export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(6)
  const totalPages = ref(1)
  const sort = ref<'sid' | 'price'>('sid')
  const order = ref<'asc' | 'desc'>('asc')
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** 价格项是否处于高亮态（升或降），对应原站 li.paipai 视觉 */
  const priceActive = computed(() => sort.value === 'price')
  const priceDesc = computed(() => sort.value === 'price' && order.value === 'desc')

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      const res = await api.products({ page: page.value, pageSize: pageSize.value, sort: sort.value, order: order.value })
      items.value = res.items
      total.value = res.total
      page.value = res.page
      pageSize.value = res.pageSize
      totalPages.value = res.totalPages
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function goto(target: number) {
    const p = Math.min(Math.max(1, target), totalPages.value)
    page.value = p
    return fetchList()
  }

  function nextPage() {
    return goto(page.value + 1)
  }

  function prevPage() {
    return goto(page.value - 1)
  }

  /** 价格两态 toggle（museum 实测行为：升↔降）；从默认序进入时为升序 */
  function togglePrice() {
    if (sort.value !== 'price') {
      sort.value = 'price'
      order.value = 'asc'
    } else {
      order.value = order.value === 'asc' ? 'desc' : 'asc'
    }
    page.value = 1
    return fetchList()
  }

  /** 其他查找项（今日推荐/销量/上架时间/特惠）：数据无对应维度，恢复默认序（等效原站点击无实际效果） */
  function resetOrder() {
    sort.value = 'sid'
    order.value = 'asc'
    page.value = 1
    return fetchList()
  }

  return {
    items, total, page, pageSize, totalPages, sort, order, loading, error,
    priceActive, priceDesc,
    fetchList, goto, nextPage, prevPage, togglePrice, resetOrder,
  }
})
