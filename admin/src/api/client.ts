/**
 * 管理端 API 封装（admin 联动批次 1）。风格对齐 app/src/api/client.ts，
 * 差异：401/403 的 message 由调用方（路由守卫/组件）以 ElMessage 呈现，
 * 不在此处弹窗；请求体 JSON 序列化约定与 C 端一致。
 */

export interface AdminError extends Error {
  status: number
}

/** 管理端商品（admin 联动批次 2；含下架全量，与 C 端 Product 的差异：status/stock） */
export interface AdminProduct {
  id: number
  sid: number
  name: string
  brand: string
  price: number
  description: string
  image: string | null
  legacyUrl: string | null
  category: string | null
  sales: number
  createdAt: number
  status: number
  stock: number
}

export interface AdminProductPage {
  items: AdminProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminProductQuery {
  page?: number
  pageSize?: number
  q?: string
  category?: string
  status?: 0 | 1 | ''
}

/** 首页分类菜单（C 端公开接口 /api/menu 复用；商品 category 存二级 item 名） */
export interface MenuCategory {
  title: string
  icon: string
  items: string[]
}

async function request<T>(
  path: string,
  options?: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown },
): Promise<T> {
  const method = options?.method ?? 'GET'
  const res = await fetch(path, {
    method,
    headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(options?.body ?? {}),
  })
  if (!res.ok) {
    let message = `请求失败：${res.status} ${res.statusText}`
    try {
      const data = (await res.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      // 非 JSON 响应体，保留默认 message
    }
    const err = new Error(message) as AdminError
    err.status = res.status
    throw err
  }
  return (await res.json()) as T
}

export const api = {
  // —— 管理端认证（server/src/routes/admin/auth.ts；蓝本：src-one router/login.js）——
  adminLogin: (username: string, password: string): Promise<{ ok: true; username: string }> =>
    request<{ ok: true; username: string }>('/api/admin/auth/login', {
      method: 'POST',
      body: { username, password },
    }),
  adminLogout: (): Promise<{ ok: true }> =>
    request<{ ok: true }>('/api/admin/auth/logout', { method: 'POST' }),
  adminMe: (): Promise<{ username: string }> => request<{ username: string }>('/api/admin/auth/me'),

  // —— 商品管理（admin 联动批次 2；蓝本：src-one router/goods.js 的 REST 重写）——
  adminProducts: (query: AdminProductQuery = {}): Promise<AdminProductPage> => {
    const qs = new URLSearchParams()
    if (query.page != null) qs.set('page', String(query.page))
    if (query.pageSize != null) qs.set('pageSize', String(query.pageSize))
    if (query.q != null && query.q !== '') qs.set('q', query.q)
    if (query.category != null && query.category !== '') qs.set('category', query.category)
    if (query.status === 0 || query.status === 1) qs.set('status', String(query.status))
    const suffix = qs.toString()
    return request<AdminProductPage>(`/api/admin/products${suffix ? `?${suffix}` : ''}`)
  },
  adminProductCreate: (body: Partial<AdminProduct>): Promise<AdminProduct> =>
    request<AdminProduct>('/api/admin/products', { method: 'POST', body }),
  adminProductUpdate: (sid: number, body: Partial<AdminProduct>): Promise<AdminProduct> =>
    request<AdminProduct>(`/api/admin/products/${sid}`, { method: 'PUT', body }),
  adminProductStatus: (sid: number, status: 0 | 1): Promise<AdminProduct> =>
    request<AdminProduct>(`/api/admin/products/${sid}/status`, { method: 'PATCH', body: { status } }),
  adminProductRemove: (sid: number): Promise<{ ok: true }> =>
    request<{ ok: true }>(`/api/admin/products/${sid}`, { method: 'DELETE' }),

  // —— 公开数据（C 端接口复用）——
  menu: (): Promise<MenuCategory[]> => request<MenuCategory[]>('/api/menu'),
}
