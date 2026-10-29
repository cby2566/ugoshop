/**
 * 轻量 toast（T1：替代 Element Plus 的唯一依赖点 ElMessage）。
 * 风格对齐现站：错误 #f70800 红系、成功/信息用站内主色与深灰；
 * 固定顶部居中、3s 自动消失；容器与条目均为运行时创建，无样式文件依赖。
 */

export type ToastType = 'error' | 'success' | 'info'

const TOAST_MS = 3000
const FADE_MS = 250

const STYLE_MAP: Record<ToastType, { background: string; color: string }> = {
  error: { background: '#f70800', color: '#fff' },
  success: { background: '#00bfcf', color: '#fff' },
  info: { background: 'rgba(51,51,51,.92)', color: '#fff' },
}

let container: HTMLDivElement | null = null

function ensureContainer(): HTMLDivElement {
  if (container && document.body.contains(container)) return container
  container = document.createElement('div')
  container.id = 'ugoshop-toast'
  container.style.cssText =
    'position:fixed;top:20px;left:0;right:0;display:flex;flex-direction:column;' +
    'align-items:center;gap:8px;z-index:9999;pointer-events:none;'
  document.body.appendChild(container)
  return container
}

export function toast(message: string, type: ToastType = 'info') {
  const style = STYLE_MAP[type]
  const el = document.createElement('div')
  el.textContent = message
  el.style.cssText =
    `max-width:70vw;padding:10px 18px;border-radius:4px;font-size:13px;line-height:1.5;` +
    `background:${style.background};color:${style.color};` +
    'box-shadow:0 2px 10px rgba(0,0,0,.18);opacity:0;transition:opacity .25s ease;'
  ensureContainer().appendChild(el)
  requestAnimationFrame(() => {
    el.style.opacity = '1'
  })
  window.setTimeout(() => {
    el.style.opacity = '0'
    window.setTimeout(() => el.remove(), FADE_MS)
  }, TOAST_MS)
}
