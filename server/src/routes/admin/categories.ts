import type { FastifyInstance } from 'fastify'
import { asc, eq, max } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { categories, categoryItems } from '../../db/schema.js'

/**
 * 分类管理接口（admin 联动批次 3）。蓝本：src-one（2018）router/goods.js 的
 * classify 三接口——GET /goods/classify（列表）、/classify/add（INSERT qname）、
 * /classify/amend（UPDATE qname WHERE qid），扁平一级结构。
 *
 * 重写为两级（categories + categoryItems，对齐前台菜单数据结构）：
 * - 一级分类 CRUD：POST /、PUT /:id、DELETE /:id（级联删除其下二级项，
 *   原版无级联概念，重写补上——与商品删除级联 cart 同一纪律）；
 * - 二级项 CRUD：POST /:id/items、PUT /:id/items/:itemId、DELETE /items/:itemId。
 * C 端 /api/menu 直读 categories/categoryItems——分类改动前台菜单即时生效。
 * icon 沿用 museum 系列图标文件名（前端拼 /museum/css-img/ 前缀），
 * 新建分类默认取第一组菜单图标，可在编辑中改。
 */

const DEFAULT_ICON = 'newsix_03.png'

export async function categoryAdminRoutes(app: FastifyInstance) {
  // 列表：两级结构（带 id，对齐 C 端 menu 形态）
  app.get('/', async () => {
    const cats = await db.select().from(categories).orderBy(asc(categories.sort))
    const items = await db.select().from(categoryItems).orderBy(asc(categoryItems.sort))
    return cats.map((c) => ({
      id: c.id,
      title: c.title,
      icon: c.icon,
      sort: c.sort,
      items: items
        .filter((i) => i.categoryId === c.id)
        .map((i) => ({ id: i.id, name: i.name, sort: i.sort })),
    }))
  })

  // 新建一级分类（对照原版 /classify/add 的 INSERT qname）
  app.post('/', async (request, reply) => {
    const body = (request.body ?? {}) as { title?: string; icon?: string }
    const title = (body.title ?? '').trim()
    if (!title) {
      return reply.code(400).send({ message: '分类名称必填' })
    }
    const [{ maxSort }] = await db.select({ maxSort: max(categories.sort) }).from(categories)
    const [created] = await db
      .insert(categories)
      .values({ title, icon: (body.icon ?? '').trim() || DEFAULT_ICON, sort: (maxSort ?? -1) + 1 })
      .returning()
    return reply.code(201).send(created)
  })

  // 编辑一级分类（对照原版 /classify/amend 的 UPDATE qname WHERE qid）
  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const catId = Number.parseInt(id, 10)
    if (!Number.isFinite(catId)) {
      return reply.code(400).send({ message: '分类 ID 应为数字' })
    }
    const body = (request.body ?? {}) as { title?: string; icon?: string; sort?: number }
    const patch: { title?: string; icon?: string; sort?: number } = {}
    if (typeof body.title === 'string' && body.title.trim()) patch.title = body.title.trim()
    if (typeof body.icon === 'string' && body.icon.trim()) patch.icon = body.icon.trim()
    if (Number.isFinite(Number(body.sort))) patch.sort = Number(body.sort)
    if (Object.keys(patch).length === 0) {
      return reply.code(400).send({ message: '无可更新字段' })
    }
    const [updated] = await db.update(categories).set(patch).where(eq(categories.id, catId)).returning()
    if (!updated) {
      return reply.code(404).send({ message: '分类不存在' })
    }
    return reply.send(updated)
  })

  // 删除一级分类（级联删除其下二级项）
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const catId = Number.parseInt(id, 10)
    if (!Number.isFinite(catId)) {
      return reply.code(400).send({ message: '分类 ID 应为数字' })
    }
    const [exists] = await db.select().from(categories).where(eq(categories.id, catId))
    if (!exists) {
      return reply.code(404).send({ message: '分类不存在' })
    }
    await db.delete(categoryItems).where(eq(categoryItems.categoryId, catId))
    await db.delete(categories).where(eq(categories.id, catId))
    return reply.send({ ok: true })
  })

  // 新建二级项（分类下）
  app.post('/:id/items', async (request, reply) => {
    const { id } = request.params as { id: string }
    const catId = Number.parseInt(id, 10)
    if (!Number.isFinite(catId)) {
      return reply.code(400).send({ message: '分类 ID 应为数字' })
    }
    const body = (request.body ?? {}) as { name?: string }
    const name = (body.name ?? '').trim()
    if (!name) {
      return reply.code(400).send({ message: '二级项名称必填' })
    }
    const [cat] = await db.select().from(categories).where(eq(categories.id, catId))
    if (!cat) {
      return reply.code(404).send({ message: '分类不存在' })
    }
    const [{ maxSort }] = await db
      .select({ maxSort: max(categoryItems.sort) })
      .from(categoryItems)
      .where(eq(categoryItems.categoryId, catId))
    const [created] = await db
      .insert(categoryItems)
      .values({ categoryId: catId, name, sort: (maxSort ?? -1) + 1 })
      .returning()
    return reply.code(201).send(created)
  })

  // 编辑二级项
  app.put('/:id/items/:itemId', async (request, reply) => {
    const { id, itemId } = request.params as { id: string; itemId: string }
    const catId = Number.parseInt(id, 10)
    const rowId = Number.parseInt(itemId, 10)
    if (!Number.isFinite(catId) || !Number.isFinite(rowId)) {
      return reply.code(400).send({ message: 'ID 应为数字' })
    }
    const body = (request.body ?? {}) as { name?: string; sort?: number }
    const patch: { name?: string; sort?: number } = {}
    if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim()
    if (Number.isFinite(Number(body.sort))) patch.sort = Number(body.sort)
    if (Object.keys(patch).length === 0) {
      return reply.code(400).send({ message: '无可更新字段' })
    }
    const [updated] = await db
      .update(categoryItems)
      .set(patch)
      .where(eq(categoryItems.id, rowId))
      .returning()
    if (!updated) {
      return reply.code(404).send({ message: '二级项不存在' })
    }
    return reply.send(updated)
  })

  // 删除单个二级项
  app.delete('/items/:itemId', async (request, reply) => {
    const { itemId } = request.params as { itemId: string }
    const rowId = Number.parseInt(itemId, 10)
    if (!Number.isFinite(rowId)) {
      return reply.code(400).send({ message: 'ID 应为数字' })
    }
    const [exists] = await db.select().from(categoryItems).where(eq(categoryItems.id, rowId))
    if (!exists) {
      return reply.code(404).send({ message: '二级项不存在' })
    }
    await db.delete(categoryItems).where(eq(categoryItems.id, rowId))
    return reply.send({ ok: true })
  })
}
