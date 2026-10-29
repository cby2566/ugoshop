import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'

import { ADMIN_SESSION_COOKIE, getAdminSessionUsername } from './auth.js'

/**
 * 管理端统一守卫（admin 联动批次 1）。
 *
 * 原版对照（src-one · 2018）：后台接口零鉴权——goods.js / user.js 的增删改
 * 任何请求可直接调用，登录页 idcode 图形验证码纯前端校验形同虚设，
 * login.js 的 SQL 字符串拼接更使"登录"本身可注入绕过。
 * 重写：签名 cookie 会话 + users.role 双重校验，admin 业务路由统一挂载本守卫；
 * 会话每次实时查库核 role（管理员被降权后旧会话立即失效）。
 */

export function makeAdminGuard(app: FastifyInstance) {
  return async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
    const username = getAdminSessionUsername(app, request)
    if (!username) {
      return reply.code(401).send({ message: '未登录或会话失效' })
    }
    const [user] = await db.select().from(users).where(eq(users.username, username))
    if (!user || user.role !== 'admin') {
      return reply.code(403).send({ message: '无管理权限' })
    }
  }
}

export { ADMIN_SESSION_COOKIE }
