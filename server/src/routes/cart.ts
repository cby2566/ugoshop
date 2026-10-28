import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { and, eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { cart, products, users } from '../db/schema.js'
import { getSessionUsername } from './auth.js'

/**
 * 购物车接口。对应原版 car.php 的四种 flag（g 列表 / jia 更新数量 / y 数量查询 /
 * news 新增）与 del.php、addCar.php，以 REST 重写；全部要求登录（A 方案：登录才能加购），
 * userId 由签名会话解析。原版按用户名子查询关联、数量直传覆盖，重写按 (userId, sid) upsert。
 */

/** 解析会话用户；未登录返回 null 并已回复 401 */
async function requireUser(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<{ id: number } | null> {
  const username = getSessionUsername(app, request)
  if (!username) {
    await reply.code(401).send({ message: '请先登录' })
    return null
  }
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.username, username))
  if (!user) {
    await reply.code(401).send({ message: '请先登录' })
    return null
  }
  return user
}

/** 购物车行（JOIN 商品信息，对应原版 car.php?flag=g 的 JOIN 查询） */
async function selectCartRows(userId: number) {
  return db
    .select({
      sid: cart.sid,
      quantity: cart.quantity,
      name: products.name,
      price: products.price,
      image: products.image,
      legacyUrl: products.legacyUrl,
    })
    .from(cart)
    .innerJoin(products, eq(cart.sid, products.sid))
    .where(eq(cart.userId, userId))
    .orderBy(cart.id)
}

export async function cartRoutes(app: FastifyInstance) {
  // 列表 + 条目数（原版 flag=g；count 供顶栏/侧栏 badge，语义同原版 flag=y 的条目数）
  app.get('/api/cart', async (request, reply) => {
    const user = await requireUser(app, request, reply)
    if (!user) return reply
    const items = await selectCartRows(user.id)
    return reply.send({ items, count: items.length })
  })

  // 加入购物车（原版 addCar.php 检查 + news/jia 两分支的合并 upsert：已存在累加）
  app.post('/api/cart', async (request, reply) => {
    const user = await requireUser(app, request, reply)
    if (!user) return reply
    const body = (request.body ?? {}) as { sid?: number; quantity?: number }
    const sid = Number(body.sid)
    const quantity = Number(body.quantity ?? 1)
    if (!Number.isFinite(sid) || !Number.isFinite(quantity) || quantity < 1) {
      return reply.code(400).send({ message: '参数有误' })
    }
    const [product] = await db.select().from(products).where(eq(products.sid, sid))
    if (!product) {
      return reply.code(404).send({ message: '商品不存在' })
    }
    const [existing] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, user.id), eq(cart.sid, sid)))
    if (existing) {
      await db
        .update(cart)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cart.id, existing.id))
    } else {
      await db.insert(cart).values({ userId: user.id, sid, quantity })
    }
    const items = await selectCartRows(user.id)
    return reply.send({ ok: true, items, count: items.length })
  })

  // 更新数量（原版 flag=jia；最小 1）
  app.patch('/api/cart/:sid', async (request, reply) => {
    const user = await requireUser(app, request, reply)
    if (!user) return reply
    const { sid } = request.params as { sid: string }
    const body = (request.body ?? {}) as { quantity?: number }
    const quantity = Number(body.quantity)
    if (!Number.isFinite(Number(sid)) || !Number.isFinite(quantity) || quantity < 1) {
      return reply.code(400).send({ message: '参数有误' })
    }
    await db
      .update(cart)
      .set({ quantity })
      .where(and(eq(cart.userId, user.id), eq(cart.sid, Number(sid))))
    const items = await selectCartRows(user.id)
    return reply.send({ ok: true, items, count: items.length })
  })

  // 删除（原版 del.php）
  app.delete('/api/cart/:sid', async (request, reply) => {
    const user = await requireUser(app, request, reply)
    if (!user) return reply
    const { sid } = request.params as { sid: string }
    await db.delete(cart).where(and(eq(cart.userId, user.id), eq(cart.sid, Number(sid))))
    const items = await selectCartRows(user.id)
    return reply.send({ ok: true, items, count: items.length })
  })
}