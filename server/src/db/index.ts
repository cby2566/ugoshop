import { mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from './schema.js'

const dataDir = fileURLToPath(new URL('../../data', import.meta.url))
mkdirSync(dataDir, { recursive: true })

export const dbPath = fileURLToPath(new URL('../../data/ugoshop.db', import.meta.url))

// libsql 本地 file 模式即标准 SQLite 文件（napi 二进制，跨 Node 大版本通用）
export const client = createClient({ url: pathToFileURL(dbPath).href })
export const db = drizzle(client, { schema })
