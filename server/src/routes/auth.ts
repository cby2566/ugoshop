import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

import type { FastifyInstance, FastifyRequest } from 'fastify'
import { eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { users } from '../db/schema.js'

/**
 * 认证接口。对应原版 login.php（GET ?fname 查用户名是否存在并返回明文密码、
 * GET ?fname&psw 注册）的重写：明文密码与"返回密码给前端比对"均按定案废除，
 * 改为 scrypt 哈希 + HttpOnly 签名 cookie 会话；注册唯一性检查保留即时查询
 * （原版 tel input 的 AJAX 行为）。
 * 原版 Cookie.set('name', tel, new Date()) 以当前时刻为过期时间，登录态实际
 * 存不住（cookie 立即失效）——原版 bug，重写为 30 天有效会话。
 */

// 原版用户名规则 [0-9a-z]{3,11} 保持一致
const USERNAME_RE = /^[0-9a-z]{3,11}$/
const SESSION_COOKIE = 'ugoshop_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 天

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const test = scryptSync(plain, salt, 64)
  return timingSafeEqual(Buffer.from(hash, 'hex'), test)
}

export async function authRoutes(app: FastifyInstance) {
  // 注册页用户名即时唯一性检查（原版 login.php?fname 的可用性查询部分）
  app.get('/api/auth/check', async (request) => {
    const { username } = request.query as { username?: string }
    if (!username || !USERNAME_RE.test(username)) {
      return { available: false }
    }
    const found = await db.select().from(users).where(eq(users.username, username))
    return { available: found.length === 0 }
  })

  // 注册（原版 login.php?fname&psw 的 INSERT 部分）
  app.post('/api/auth/register', async (request, reply) => {
    const body = request.body as { username?: string; password?: string }
    const username = (body.username ?? '').trim()
    const password = body.password ?? ''

    if (!USERNAME_RE.test(username)) {
      return reply.code(400).send({ message: '用户名需为 3-11 位小写字母或数字' })
    }
    if (password.length < 6) {
      return reply.code(400).send({ message: '密码需不少于 6 位' })
    }
    const found = await db.select().from(users).where(eq(users.username, username))
    if (found.length > 0) {
      return reply.code(409).send({ message: '用户名已存在' })
    }
    await db.insert(users).values({ username, password: hashPassword(password) })
    return reply.send({ ok: true, username })
  })

  // 登录（原版为前端拿明文密码比对 + Cookie 存用户名；此处服务端校验 + 签名会话）
  app.post('/api/auth/login', async (request, reply) => {
    const body = request.body as { username?: string; password?: string }
    const username = (body.username ?? '').trim()
    const password = body.password ?? ''

    const [user] = await db.select().from(users).where(eq(users.username, username))
    if (!user || !verifyPassword(password, user.password)) {
      return reply.code(401).send({ message: '用户名或密码错误' })
    }
    reply.setCookie(SESSION_COOKIE, username, {
      path: '/',
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
    })
    return reply.send({ ok: true, username })
  })

  // 退出（原版 Cookie.remove('name')）
  app.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: '/' })
    return reply.send({ ok: true })
  })

  // 当前登录态（原版各页 Cookie.get('name') 直读；此处走签名校验）
  app.get('/api/auth/me', async (request: FastifyRequest, reply) => {
    const raw = request.cookies?.[SESSION_COOKIE]
    if (!raw) {
      return reply.code(401).send({ message: '未登录' })
    }
    const unsigned = app.unsignCookie(raw)
    if (!unsigned.valid || !unsigned.value) {
      return reply.code(401).send({ message: '未登录' })
    }
    return reply.send({ username: unsigned.value })
  })
}
