import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 管理端工程配置（admin 联动批次 1）：骨架对齐 app（Vite6+TS+Pinia+Router），
// 差异仅：端口 5174/preview 4174，publicDir 同指仓库根 assets/——
// 批次 2 起商品列表直接以 /product/*.jpg、/museum/img/* 预览商品主图；
// 批次 4 起 /uploads/* 代理至 server（管理端上传图片的 dev/preview 可达）。
export default defineConfig({
  plugins: [vue()],
  publicDir: fileURLToPath(new URL('../assets', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
