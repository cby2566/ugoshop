import { randomBytes } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import type { FastifyInstance } from 'fastify'

/**
 * 管理端图片上传（admin 联动批次 4）。蓝本：src-one（2018）goods.js 的
 * multer /goods/upload——multipart 落盘到 uploads/ 后**只返回成功不写库**
 * （注释写着"存储到数据库"却未实现，缺陷清单#4：图片与商品数据断链）。
 *
 * 重写修复断链：上传落盘 server/uploads/（@fastify/static 托管于 /uploads/），
 * 返回 URL 由前端写入商品表单 image 字段随保存入库，链路闭环。
 * 传输形态取 base64 JSON 而非 multipart——练手项目免 @fastify/multipart 依赖，
 * 附 mime 白名单 + 2MB 上限（原版 multer 无任何类型与大小校验，一并补上）。
 */

// upload.ts 位于 server/src/routes/admin/，三级向上到 server/uploads（与 index.ts 静态托管同目录）
const UPLOAD_DIR = fileURLToPath(new URL('../../../uploads', import.meta.url))
const MAX_BYTES = 2 * 1024 * 1024

const EXT_BY_MIME: Record<string, string> = {
  png: 'png',
  jpeg: 'jpg',
  gif: 'gif',
  webp: 'webp',
}

export async function uploadAdminRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const body = (request.body ?? {}) as { dataUrl?: string }
    const match = /^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/.exec(body.dataUrl ?? '')
    if (!match) {
      return reply.code(400).send({ message: '仅支持 png/jpg/gif/webp 图片' })
    }
    const ext = EXT_BY_MIME[match[1]] ?? 'png'
    const buffer = Buffer.from(match[2], 'base64')
    if (buffer.length === 0) {
      return reply.code(400).send({ message: '图片内容为空' })
    }
    if (buffer.length > MAX_BYTES) {
      return reply.code(400).send({ message: '图片不超过 2MB' })
    }
    mkdirSync(UPLOAD_DIR, { recursive: true })
    const filename = `admin-${Date.now()}-${randomBytes(3).toString('hex')}.${ext}`
    await writeFile(join(UPLOAD_DIR, filename), buffer)
    return reply.send({ url: `/uploads/${filename}` })
  })
}
