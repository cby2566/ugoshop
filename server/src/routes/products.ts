import type { FastifyInstance } from 'fastify'

import { db } from '../db/index.js'
import { products } from '../db/schema.js'

export async function productRoutes(app: FastifyInstance) {
  app.get('/api/products', async () => {
    return db.select().from(products).orderBy(products.sid)
  })
}
