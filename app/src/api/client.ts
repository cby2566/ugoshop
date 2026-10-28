import type { MenuCategory, Product, ProductPage } from '@/types'

async function request<T>(
  path: string,
  options?: { method?: 'GET' | 'POST'; body?: unknown },
): Promise<T> {
  const method = options?.method ?? 'GET'
  const res = await fetch(path, {
    method,
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
    body: method === 'POST' ? JSON.stringify(options?.body ?? {}) : undefined,
  })
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

  // —— 认证（阶段 5；原版 login.php 明文密码接口的哈希重写） ——
  authCheck: (username: string): Promise<{ available: boolean }> =>
    request<{ available: boolean }>(`/api/auth/check?username=${encodeURIComponent(username)}`),
  register: (username: string, password: string): Promise<{ ok: true; username: string }> =>
    request<{ ok: true; username: string }>('/api/auth/register', {
      method: 'POST',
      body: { username, password },
    }),
  login: (username: string, password: string): Promise<{ ok: true; username: string }> =>
    request<{ ok: true; username: string }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    }),
  logout: (): Promise<{ ok: true }> => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  me: (): Promise<{ username: string }> => request<{ username: string }>('/api/auth/me'),
}
