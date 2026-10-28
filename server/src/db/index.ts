import { mkdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import * as schema from './schema.js'

const dataDir = fileURLToPath(new URL('../../data', import.meta.url))
mkdirSync(dataDir, { recursive: true })

export const dbPath = `${dataDir}/ugoshop.db`
export const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })
