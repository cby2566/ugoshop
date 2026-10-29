import type { FastifyInstance } from 'fastify'
import { asc, count, eq, like } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { cart, users } from '../../db/schema.js'
import { hashPassword } from '../auth.js'

/**
 * 用户管理接口（admin 联动批次 3）。蓝本：src-one（2018）router/user.js——
 *
 * - GET /user：原版取全表后在 Node 层 splice 做分页，且 "count" 返回的是
 *   当前页条数（dataArr1.length）——分页失真，缺陷清单#3；
 *   重写为 SQL 真分页 + 真实 total（count()）。
 * - GET /user/add、/user/amend：原版明文 INSERT/UPDATE 密码（fpws）；
 *   重写为 scrypt 哈希（重置密码 PATCH /:id/password，新建 POST /）。
 * - DELETE：原版按 fid 删用户无任何保护；重写补两条纪律：
 *   ① role=admin 的账号禁删（防止管理端自锁）；
 *   ② 级联清理该用户 cart 行（幽灵引用，与商品删除对称）。
 * 原版 status 列的"仅显示 status=1"过滤语义在 rebuild 中由 role 取代，不引入。
 */

const USERNAME_RE = /^[0-9a-z]{3,11}$/

export async function userAdminRoutes(app: FastifyInstance) {
  // 列表（真分页 + 真 count；q 搜用户名；不返回密码哈希）
  app.get('/', async (request) => {
    const q = request.query as { page?: string; pageSize?: string; q?: string }
    const pageRaw = Number.parseInt(q.page ?? '', 10)
    const sizeRaw = Number.parseInt(q.pageSize ?? '', 10)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
    const pageSize = Number.isFinite(sizeRaw) && sizeRaw >= 1 && sizeRaw <= 100 ? sizeRaw : 10

    const keyword = (q.q ?? '').trim()
    const whereExpr = keyword ? like(users.username, `%${keyword}%`) : undefined

    const [{ total }] = await db.select({ total: count() }).from(users).where(whereExpr)
    const items = await db
      .select({ id: users.id, username: users.username, role: users.role })
      .from(users)
      .where(whereExpr)
      .orderBy(asc(users.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
  })

  // 新建用户（对照原版 /user/add；scrypt 哈希，规则对齐 C 端注册）
  app.post('/', async (request, reply) => {
    const body = (request.body ?? {}) as { username?: string; password?: string }
    const username = (body.username ?? '').trim()
    const password = body.password ?? ''
    if (!USERNAME_RE.test(username)) {
      return reply.code(400).send({ message: '用户名需为 3-11 位小写字母或数字' })
    }
    if (password.length < 6) {
      return reply.code(400).send({ message: '密码需不少于 6 位' })
    }
    const [exists] = await db.select().from(users).where(eq(users.username, username))
    if (exists) {
      return reply.code(409).send({ message: '用户名已存在' })
    }
    const [created] = await db
      .insert(users)
      .values({ username, password: hashPassword(password), role: 'user' })
      .returning({ id: users.id, username: users.username, role: users.role })
    return reply.code(201).send(created)
  })

  // 重置密码（对照原版 /user/amend 明文改密的 scrypt 重写）
  app.patch('/:id/password', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = Number.parseInt(id, 10)
    if (!Number.isFinite(userId)) {
      return reply.code(400).send({ message: '用户 ID 应为数字' })
    }
    const body = (request.body ?? {}) as { password?: string }
    const password = body.password ?? ''
    if (password.length < 6) {
      return reply.code(400).send({ message: '密码需不少于 6 位' })
    }
    const [updated] = await db
      .update(users)
      .set({ password: hashPassword(password) })
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username })
    if (!updated) {
      return reply.code(404).send({ message: '用户不存在' })
    }
    return reply.send({ ok: true, ...updated })
  })

  // 删除（admin 角色禁删 + 级联清理 cart）
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = Number.parseInt(id, 10)
    if (!Number.isFinite(userId)) {
      return reply.code(400).send({ message: '用户 ID 应为数字' })
    }
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    if (!user) {
      return reply.code(404).send({ message: '用户不存在' })
    }
    if (user.role === 'admin') {
      return reply.code(403).send({ message: '管理员账号不可删除（防止管理端自锁）' })
    }
    await db.delete(cart).where(eq(cart.userId, userId))
    await db.delete(users).where(eq(users.id, userId))
    return reply.send({ ok: true })
  })
}
