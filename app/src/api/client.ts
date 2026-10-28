import type { Product } from '@/types'

async function request<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error(`请求失败：${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const api = {
  products: () => request<Product[]>('/api/products'),
}
