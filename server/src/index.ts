import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import cookiePlugin from '@fastify/cookie'

import { mkdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { authRoutes } from './routes/auth.js'
import { cartRoutes } from './routes/cart.js'
import { healthRoutes } from './routes/health.js'
import { menuRoutes } from './routes/menu.js'
import { productRoutes } from './routes/products.js'
import { adminRoutes } from './routes/admin/index.js'

const app = Fastify({ logger: true })

// 会话 cookie 签名密钥：可用环境变量 COOKIE_SECRET 覆盖（默认值为本机练手项目的固定值）
await app.register(cookiePlugin, {
  secret: process.env.COOKIE_SECRET ?? 'ugoshop-rebuild-dev-secret',
})

// admin 联动批次 4：静态托管管理端上传目录（/uploads/*）。
// 这是 P1（dist 托管）的部分前置收编——完整 dist 托管仍留待部署时实施；
// decorateReply:false 为 P1 时注册第二个静态实例预留（避免 sendFile 装饰冲突）。
const uploadsDir = fileURLToPath(new URL('../uploads', import.meta.url))
mkdirSync(uploadsDir, { recursive: true })
await app.register(fastifyStatic, {
  root: uploadsDir,
  prefix: '/uploads',
  decorateReply: false,
})

await app.register(healthRoutes)
await app.register(productRoutes)
await app.register(menuRoutes)
await app.register(authRoutes)
await app.register(cartRoutes)
await app.register(adminRoutes) // admin 联动批次 1：管理端路由组（蓝本 src-one，2018）

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '127.0.0.1'

await app.listen({ port, host })

app.log.info(`UGOShop server 已就绪：http://${host}:${port}`)
