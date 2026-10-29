import type { FastifyInstance } from 'fastify'
import { count, desc, eq, like, or, sql, sum } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { cart, products, users } from '../../db/schema.js'

/**
 * 订单管理接口（admin 联动批次 3）。蓝本：src-one（2018）router/car.js + carcar.js——
 * "订单列表"读 car 表（sid/fid/sum/cid 四列），2018 年购物车即订单的
 * 历史语义原样保留（前端菜单名不动，本注释留档）。
 *
 * 原版缺陷对照：car.js 查询了 car×f_user 的关联用户名 SQL（sql2）却从未使用
 * （缺陷清单#6 死代码），重写把 JOIN 真正用上；原版无分页无搜索，重写补齐。
 * cart 字段映射：fid→user_id、sid→sid、sum→quantity、cid→cart.id。
 * 删除单条为管理清理能力（原版无对应接口，重写增强）。
 */

export async function orderAdminRoutes(app: FastifyInstance) {
  // 列表（三表 JOIN：购物车 × 商品 × 用户；q 搜用户名/商品名）
  app.get('/', async (request) => {
    const q = request.query as { page?: string; pageSize?: string; q?: string }
    const pageRaw = Number.parseInt(q.page ?? '', 10)
    const sizeRaw = Number.parseInt(q.pageSize ?? '', 10)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
    const pageSize = Number.isFinite(sizeRaw) && sizeRaw >= 1 && sizeRaw <= 100 ? sizeRaw : 10

    const keyword = (q.q ?? '').trim()
    const whereExpr = keyword
      ? or(like(users.username, `%${keyword}%`), like(products.name, `%${keyword}%`))
      : undefined

    const baseQuery = db
      .select({
        id: cart.id,
        userId: cart.userId,
        username: users.username,
        sid: cart.sid,
        name: products.name,
        price: products.price,
        quantity: cart.quantity,
      })
      .from(cart)
      .innerJoin(products, eq(cart.sid, products.sid))
      .innerJoin(users, eq(cart.userId, users.id))

    const [{ total }] = await db
      .select({ total: count() })
      .from(cart)
      .innerJoin(products, eq(cart.sid, products.sid))
      .innerJoin(users, eq(cart.userId, users.id))
      .where(whereExpr)

    const items = await baseQuery
      .where(whereExpr)
      .orderBy(desc(cart.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    // 全站统计（不受分页影响；admin 页面顶栏展示）
    const [stats] = await db
      .select({
        totalOrders: count(),
        totalQuantity: sum(cart.quantity),
        totalAmount: sum(sql`${cart.quantity} * ${products.price}`),
      })
      .from(cart)
      .innerJoin(products, eq(cart.sid, products.sid))

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      stats: {
        totalOrders: stats.totalOrders,
        totalQuantity: Number(stats.totalQuantity ?? 0),
        totalAmount: Number(stats.totalAmount ?? 0),
      },
    }
  })

  // 删除单条记录（管理清理；原版无对应接口，重写增强）
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const rowId = Number.parseInt(id, 10)
    if (!Number.isFinite(rowId)) {
      return reply.code(400).send({ message: '订单 ID 应为数字' })
    }
    const [exists] = await db.select().from(cart).where(eq(cart.id, rowId))
    if (!exists) {
      return reply.code(404).send({ message: '订单不存在' })
    }
    await db.delete(cart).where(eq(cart.id, rowId))
    return reply.send({ ok: true })
  })
}
