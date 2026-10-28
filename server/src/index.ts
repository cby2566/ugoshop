import Fastify from 'fastify'

import { healthRoutes } from './routes/health.js'
import { menuRoutes } from './routes/menu.js'
import { productRoutes } from './routes/products.js'

const app = Fastify({ logger: true })

await app.register(healthRoutes)
await app.register(productRoutes)
await app.register(menuRoutes)

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '127.0.0.1'

await app.listen({ port, host })

app.log.info(`UGOShop server 已就绪：http://${host}:${port}`)
