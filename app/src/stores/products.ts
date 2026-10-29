import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'
import type { Product } from '@/types'

/**
 * 商品列表（列表页）。原站 footList.js 的数据加载/分页为死代码，museum 纪念版
 * 由 mock-api.js 代为激活；此处重写为真分页与真排序，交互与 museum 实际呈现一致：
 * - 价格两态 toggle（升↔降）；
 * - D2：今日推荐/销量/上架时间/特惠接真排序维度（sales 降序 / created_at 降序 /
 *   price 升序别名），activeLook 记录当前激活项供高亮；
 * - D1：category 分类过滤（列表页 6 个频道 tab + 全部商品）。
 */
export type LookKind = 'recommend' | 'sales' | 'created' | 'deal'

export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(6)
  const totalPages = ref(1)
  const sort = ref<'sid' | 'price' | 'sales' | 'created_at'>('sid')
  const order = ref<'asc' | 'desc'>('asc')
  const keyword = ref('')
  const category = ref('')
  const activeLook = ref<LookKind | ''>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** 价格项是否处于高亮态（升或降），对应原站 li.paipai 视觉 */
  const priceActive = computed(() => sort.value === 'price')
  const priceDesc = computed(() => sort.value === 'price' && order.value === 'desc')

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      const res = await api.products({
        page: page.value,
        pageSize: pageSize.value,
        sort: sort.value,
        order: order.value,
        q: keyword.value,
        category: category.value,
      })
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

  /** 价格两态 toggle（museum 实测行为：升→降）；从默认序进入时为升序 */
  function togglePrice() {
    if (sort.value !== 'price') {
      sort.value = 'price'
      order.value = 'asc'
    } else {
      order.value = order.value === 'asc' ? 'desc' : 'asc'
    }
    activeLook.value = ''
    page.value = 1
    return fetchList()
  }

  /** D2：查找项接真排序——今日推荐/销量=sales 降序、上架时间=created_at 降序、特惠=price 升序 */
  function lookup(kind: LookKind) {
    activeLook.value = kind
    if (kind === 'recommend' || kind === 'sales') {
      sort.value = 'sales'
      order.value = 'desc'
    } else if (kind === 'created') {
      sort.value = 'created_at'
      order.value = 'desc'
    } else {
      sort.value = 'price'
      order.value = 'asc'
    }
    page.value = 1
    return fetchList()
  }

  /** 恢复默认序（sid 升序），清空查找高亮 */
  function resetOrder() {
    sort.value = 'sid'
    order.value = 'asc'
    activeLook.value = ''
    page.value = 1
    return fetchList()
  }

  /** I2：设置搜索关键词（不 fetch，由调用方在 fetch 前调用） */
  function setKeyword(k: string) {
    keyword.value = k
    page.value = 1
  }

  /** D1：设置分类过滤（空=全部商品）；切换分类时清空查找高亮 */
  function setCategory(c: string) {
    category.value = c
    activeLook.value = ''
    page.value = 1
  }

  return {
    items, total, page, pageSize, totalPages, sort, order, keyword, category,
    activeLook, loading, error, priceActive, priceDesc,
    fetchList, goto, nextPage, prevPage, togglePrice, lookup, resetOrder, setKeyword, setCategory,
  }
})