import type { FastifyInstance, FastifyRequest } from 'fastify'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { verifyPassword } from '../auth.js'

/**
 * 管理端认证接口（admin 联动批次 1）。对应 src-one（2018）的 router/login.js：
 *
 *   原版：SELECT * FROM f_user WHERE fname='${username}'AND fpws='${password}'AND status=1
 *   ——SQL 字符串拼接（注入）+ 明文密码比对，当年 f_user 同表混管前台用户与后台登录。
 *
 * 重写：users 表 scrypt 校验 + role='admin' 判定；会话独立签发 admin_session
 * 签名 cookie，与 C 端 ugoshop_session 完全隔离——C 端登录态进 admin 一律 401，
 * 反之亦然（原版无此概念，两套界面当年本就共用同一登录）。
 * 原版登录页的 idcode 图形验证码为纯前端校验，无安全价值，不沿用（注释留档）。
 */

const USERNAME_RE = /^[0-9a-z]{3,11}$/
export const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 天

/** 从签名 cookie 解出当前管理端登录用户名（未登录/签名无效返回 null） */
export function getAdminSessionUsername(app: FastifyInstance, request: FastifyRequest): string | null {
  const raw = request.cookies?.[ADMIN_SESSION_COOKIE]
  if (!raw) return null
  const unsigned = app.unsignCookie(raw)
  return unsigned.valid ? unsigned.value : null
}

export async function adminAuthRoutes(app: FastifyInstance) {
  // 管理端登录
  app.post('/login', async (request, reply) => {
    const body = (request.body ?? {}) as { username?: string; password?: string }
    const username = (body.username ?? '').trim()
    const password = body.password ?? ''

    if (!USERNAME_RE.test(username)) {
      return reply.code(400).send({ message: '用户名需为 3-11 位小写字母或数字' })
    }

    const [user] = await db.select().from(users).where(eq(users.username, username))
    if (!user || !verifyPassword(password, user.password)) {
      return reply.code(401).send({ message: '用户名或密码错误' })
    }
    if (user.role !== 'admin') {
      return reply.code(403).send({ message: '该账号无管理权限' })
    }

    reply.setCookie(ADMIN_SESSION_COOKIE, username, {
      path: '/',
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
    })
    return reply.send({ ok: true, username })
  })

  // 退出登录
  app.post('/logout', async (_request, reply) => {
    reply.clearCookie(ADMIN_SESSION_COOKIE, { path: '/' })
    return reply.send({ ok: true })
  })

  // 当前管理端登录态（路由守卫与前端 Pinia store 复用）
  app.get('/me', async (request, reply) => {
    const username = getAdminSessionUsername(app, request)
    if (!username) {
      return reply.code(401).send({ message: '未登录' })
    }
    const [user] = await db.select().from(users).where(eq(users.username, username))
    if (!user || user.role !== 'admin') {
      return reply.code(403).send({ message: '无管理权限' })
    }
    return reply.send({ username })
  })
}
