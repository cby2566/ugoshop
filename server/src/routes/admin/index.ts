import type { FastifyInstance } from 'fastify'

import { adminAuthRoutes } from './auth.js'
import { categoryAdminRoutes } from './categories.js'
import { makeAdminGuard } from './guard.js'
import { orderAdminRoutes } from './orders.js'
import { productAdminRoutes } from './products.js'
import { userAdminRoutes } from './users.js'

/**
 * 管理端路由组（admin 联动批次 1 骨架 / 批次 2 起实装）。
 * 蓝本：src-one（2018）router/index.js 的 /login、/user、/goods、/car、/list 五组——
 * 其中 /list 为当年测试路由（硬编码假数据），不迁移。
 * 业务路由统一挂 makeAdminGuard 守卫（对照原版零鉴权缺陷，见 guard.ts 注释）。
 */
export async function adminRoutes(app: FastifyInstance) {
  // 认证（无守卫：login 本身即入口；logout 无需会话；me 内部自行校验）
  await app.register(adminAuthRoutes, { prefix: '/api/admin/auth' })

  // —— 业务路由（批次 2：商品；批次 3：分类/用户/订单；蓝本四模块至此全部落地）——
  const adminGuard = makeAdminGuard(app)
  await app.register(async (business) => {
    business.addHook('preHandler', adminGuard)
    await business.register(productAdminRoutes, { prefix: '/api/admin/products' })
    await business.register(categoryAdminRoutes, { prefix: '/api/admin/categories' })
    await business.register(userAdminRoutes, { prefix: '/api/admin/users' })
    await business.register(orderAdminRoutes, { prefix: '/api/admin/orders' })
  })
}
