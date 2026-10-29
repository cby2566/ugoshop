/**
 * 管理端 API 封装（admin 联动批次 1）。风格对齐 app/src/api/client.ts，
 * 差异：401/403 的 message 由调用方（路由守卫/组件）以 ElMessage 呈现，
 * 不在此处弹窗；请求体 JSON 序列化约定与 C 端一致。
 */

export interface AdminError extends Error {
  status: number
}

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
}
