import type { FastifyInstance } from 'fastify'

import { db } from '../db/index.js'
import { categories, categoryItems } from '../db/schema.js'

export async function menuRoutes(app: FastifyInstance) {
  app.get('/api/menu', async () => {
    const cats = await db.select().from(categories).orderBy(categories.sort)
    const items = await db.select().from(categoryItems).orderBy(categoryItems.sort)

    return cats.map((c) => ({
      title: c.title,
      icon: c.icon,
      items: items.filter((i) => i.categoryId === c.id).map((i) => i.name),
    }))
  })
}
