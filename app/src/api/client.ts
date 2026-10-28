import type { MenuCategory, Product, ProductPage } from '@/types'

async function request<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error(`请求失败：${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export interface ProductQuery {
  page?: number
  pageSize?: number
  /** sid=默认序，price=按价格（原版唯一实现了维度的排序） */
  sort?: 'sid' | 'price'
  order?: 'asc' | 'desc'
}

export const api = {
  products: (query: ProductQuery = {}): Promise<ProductPage> => {
    const qs = new URLSearchParams()
    if (query.page != null) qs.set('page', String(query.page))
    if (query.pageSize != null) qs.set('pageSize', String(query.pageSize))
    if (query.sort != null) qs.set('sort', query.sort)
    if (query.order != null) qs.set('order', query.order)
    const suffix = qs.toString()
    return request<ProductPage>(`/api/products${suffix ? `?${suffix}` : ''}`)
  },
  product: (sid: number): Promise<Product> => request<Product>(`/api/products/${sid}`),
  menu: (): Promise<MenuCategory[]> => request<MenuCategory[]>('/api/menu'),
}
