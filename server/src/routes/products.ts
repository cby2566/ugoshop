import type { FastifyInstance } from 'fastify'
import { asc, count, desc, eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { products } from '../db/schema.js'

/**
 * 商品接口。对应原站 ulist2.php 的三种 flag（s 全量 / d 分页 / i 单查），
 * 以现代 REST 语义重写：分页/排序走查询参数，单查走路径参数。
 * 原版每页 6 条（LIMIT page*6），此处 pageSize 默认值保持 6。
 */
export async function productRoutes(app: FastifyInstance) {
  app.get('/api/products', async (request) => {
    const q = request.query as {
      page?: string
      pageSize?: string
      sort?: string
      order?: string
    }

    const pageRaw = Number.parseInt(q.page ?? '', 10)
    const sizeRaw = Number.parseInt(q.pageSize ?? '', 10)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
    const pageSize = Number.isFinite(sizeRaw) && sizeRaw >= 1 && sizeRaw <= 100 ? sizeRaw : 6

    // 默认按 sid 升序（原版默认序）；sort=price 时按价格，order 控制升降
    const orderExpr =
      q.sort === 'price'
        ? q.order === 'desc'
          ? desc(products.price)
          : asc(products.price)
        : asc(products.sid)

    const [{ total }] = await db.select({ total: count() }).from(products)
    const items = await db
      .select()
      .from(products)
      .orderBy(orderExpr)
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  })

  // 单查（详情页阶段使用）：/api/products/:sid
  app.get('/api/products/:sid', async (request, reply) => {
    const { sid } = request.params as { sid: string }
    const id = Number.parseInt(sid, 10)
    if (!Number.isFinite(id)) {
      return reply.code(400).send({ message: '商品 ID 应为数字' })
    }
    const [item] = await db.select().from(products).where(eq(products.sid, id))
    if (!item) {
      return reply.code(404).send({ message: '商品不存在' })
    }
    return item
  })
}
