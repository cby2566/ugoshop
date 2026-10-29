import type { FastifyInstance } from 'fastify'
import { and, asc, count, eq, like, max, or } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { cart, products } from '../../db/schema.js'

/**
 * 商品管理接口（admin 联动批次 2）。蓝本：src-one（2018）router/goods.js——
 *
 * - GET /goods：LayUI 表格分页；
 * - GET /goods/insert、/goods/update：形参 (res,req) 反写（负负得正侥幸可跑）
 *   + SQL 字符串拼接，重写为 REST 动词 + Drizzle 参数化；
 * - GET /goods/updown：DIAN=1(上架)/2(下架)，重写归一化 status=1/0；
 * - DELETE /goods?id=SID：单接口按 id 参数分发删 ulist/classify/f_user 三表
 *   （越权面大），重写为单资源接口，并级联清理 cart 残留引用——
 *   cart 行 innerJoin products，商品删除后残留行为幽灵数据（原版无级联，重写补上）。
 *
 * 本组返回全量（含下架）；C 端 /api/products 自批次 2 起过滤 status=1。
 * 图片：批次 2 遵原版 UPDATE 不动 URL 字段，批次 4 随上传链路解除——
 * image 可选可写（原版上传只落盘不入库的断链缺陷由 upload.ts + 前端写入 image 闭环）。
 */

interface ProductPayload {
  name?: string
  brand?: string
  price?: number
  description?: string
  category?: string | null
  stock?: number
  status?: number
  image?: string | null
}

/** 校验并提取可写字段；返回 null 表示载荷不合法 */
function parsePayload(body: ProductPayload) {
  const name = (body.name ?? '').trim()
  const brand = (body.brand ?? '').trim()
  const price = Number(body.price)
  if (!name || !brand || !Number.isFinite(price) || price < 0) {
    return null
  }
  const stock = Number.isFinite(Number(body.stock)) ? Number(body.stock) : 0
  const status = body.status === 0 || body.status === 1 ? body.status : 1
  // 批次 4：image 可选——仅当载荷携带时更新（不传则不动原值，避免编辑其他字段时抹图）
  const hasImage = body.image !== undefined
  return {
    name,
    brand,
    price: Math.round(price),
    description: (body.description ?? '').trim(),
    category: (body.category ?? '') === '' ? null : (body.category as string),
    stock: stock < 0 ? 0 : Math.round(stock),
    status,
    ...(hasImage ? { image: (body.image ?? '') === '' ? null : String(body.image) } : {}),
  }
}

export async function productAdminRoutes(app: FastifyInstance) {
  // 列表（全量含下架；q 对 name/brand 模糊；category 精确；status 筛选可选）
  app.get('/', async (request) => {
    const q = request.query as {
      page?: string
      pageSize?: string
      q?: string
      category?: string
      status?: string
    }

    const pageRaw = Number.parseInt(q.page ?? '', 10)
    const sizeRaw = Number.parseInt(q.pageSize ?? '', 10)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
    const pageSize = Number.isFinite(sizeRaw) && sizeRaw >= 1 && sizeRaw <= 100 ? sizeRaw : 10

    const conditions = []
    const keyword = (q.q ?? '').trim()
    if (keyword) {
      conditions.push(or(like(products.name, `%${keyword}%`), like(products.brand, `%${keyword}%`)))
    }
    const category = (q.category ?? '').trim()
    if (category) {
      conditions.push(eq(products.category, category))
    }
    if (q.status === '0' || q.status === '1') {
      conditions.push(eq(products.status, Number(q.status)))
    }
    const whereExpr = conditions.length > 0 ? and(...conditions) : undefined

    const [{ total }] = await db.select({ total: count() }).from(products).where(whereExpr)
    const items = await db
      .select()
      .from(products)
      .where(whereExpr)
      .orderBy(asc(products.sid))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
  })

  // 新建（对照 goods.js /insert 的反参缺陷；sid 承袭原版业务主键语义，取 max+1）
  app.post('/', async (request, reply) => {
    const payload = parsePayload((request.body ?? {}) as ProductPayload)
    if (!payload) {
      return reply.code(400).send({ message: '名称/品牌/价格必填且价格需为非负数' })
    }
    const [{ maxSid }] = await db.select({ maxSid: max(products.sid) }).from(products)
    const [created] = await db
      .insert(products)
      .values({ sid: (maxSid ?? 0) + 1, sales: 0, createdAt: Date.now(), ...payload })
      .returning()
    return reply.code(201).send(created)
  })

  // 编辑（对照 goods.js /update；原版 UPDATE 不含 URL 字段，本批同样不动 image）
  app.put('/:sid', async (request, reply) => {
    const { sid } = request.params as { sid: string }
    const id = Number.parseInt(sid, 10)
    if (!Number.isFinite(id)) {
      return reply.code(400).send({ message: '商品 ID 应为数字' })
    }
    const payload = parsePayload((request.body ?? {}) as ProductPayload)
    if (!payload) {
      return reply.code(400).send({ message: '名称/品牌/价格必填且价格需为非负数' })
    }
    const [updated] = await db
      .update(products)
      .set(payload)
      .where(eq(products.sid, id))
      .returning()
    if (!updated) {
      return reply.code(404).send({ message: '商品不存在' })
    }
    return reply.send(updated)
  })

  // 上下架（对照 goods.js /goods/updown 的 DIAN=1/2；重写 status 1/0）
  app.patch('/:sid/status', async (request, reply) => {
    const { sid } = request.params as { sid: string }
    const id = Number.parseInt(sid, 10)
    const body = (request.body ?? {}) as { status?: number }
    if (!Number.isFinite(id) || (body.status !== 0 && body.status !== 1)) {
      return reply.code(400).send({ message: '参数有误（status 应为 0 或 1）' })
    }
    const [updated] = await db
      .update(products)
      .set({ status: body.status })
      .where(eq(products.sid, id))
      .returning()
    if (!updated) {
      return reply.code(404).send({ message: '商品不存在' })
    }
    return reply.send(updated)
  })

  // 删除（对照 goods.js DELETE 的三表分发缺陷；级联清理 cart 引用）
  app.delete('/:sid', async (request, reply) => {
    const { sid } = request.params as { sid: string }
    const id = Number.parseInt(sid, 10)
    if (!Number.isFinite(id)) {
      return reply.code(400).send({ message: '商品 ID 应为数字' })
    }
    const [exists] = await db.select().from(products).where(eq(products.sid, id))
    if (!exists) {
      return reply.code(404).send({ message: '商品不存在' })
    }
    await db.delete(cart).where(eq(cart.sid, id))
    await db.delete(products).where(eq(products.sid, id))
    return reply.send({ ok: true })
  })
}
