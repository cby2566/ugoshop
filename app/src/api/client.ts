import type { MenuCategory, Product, ProductPage } from '@/types'

async function request<T>(
  path: string,
  options?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown },
): Promise<T> {
  const method = options?.method ?? 'GET'
  const res = await fetch(path, {
    method,
    headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(options?.body ?? {}),
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

/** 购物车行（JOIN 商品信息，对应原版 car.php?flag=g） */
export interface CartItem {
  sid: number
  quantity: number
  name: string
  price: number
  image: string | null
  legacyUrl: string | null
}

export interface CartPayload {
  items: CartItem[]
  count: number
  ok?: boolean
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

  // —— 购物车（阶段 6；原版 car.php/del.php 的 REST 重写，全部要求登录） ——
  cartList: (): Promise<CartPayload> => request<CartPayload>('/api/cart'),
  cartAdd: (sid: number, quantity: number): Promise<CartPayload> =>
    request<CartPayload>('/api/cart', { method: 'POST', body: { sid, quantity } }),
  cartUpdate: (sid: number, quantity: number): Promise<CartPayload> =>
    request<CartPayload>(`/api/cart/${sid}`, { method: 'PATCH', body: { quantity } }),
  cartRemove: (sid: number): Promise<CartPayload> =>
    request<CartPayload>(`/api/cart/${sid}`, { method: 'DELETE', body: {} }),
}
