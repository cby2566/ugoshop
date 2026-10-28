import Fastify from 'fastify'
import cookiePlugin from '@fastify/cookie'

import { authRoutes } from './routes/auth.js'
import { cartRoutes } from './routes/cart.js'
import { healthRoutes } from './routes/health.js'
import { menuRoutes } from './routes/menu.js'
import { productRoutes } from './routes/products.js'

const app = Fastify({ logger: true })

// 会话 cookie 签名密钥：可用环境变量 COOKIE_SECRET 覆盖（默认值为本机练手项目的固定值）
await app.register(cookiePlugin, {
  secret: process.env.COOKIE_SECRET ?? 'ugoshop-rebuild-dev-secret',
})

await app.register(healthRoutes)
await app.register(productRoutes)
await app.register(menuRoutes)
await app.register(authRoutes)
await app.register(cartRoutes)

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '127.0.0.1'

await app.listen({ port, host })

app.log.info(`UGOShop server 已就绪：http://${host}:${port}`)
