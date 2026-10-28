import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { db } from '../src/db/index.js'
import { products } from '../src/db/schema.js'

interface RawProduct {
  SID: number
  SNAME: string
  STAG: string
  PRICE: number
  URL: string
  SCON: string
}

// 已有 AI 商品主图的商品（assets/product/，前端经 publicDir 直取）
const imageOverrides: Record<number, string> = {
  6: '/product/jade-bracelet.jpg',
}

const rawPath = fileURLToPath(new URL('../../doc/products.json', import.meta.url))
const raw = JSON.parse(readFileSync(rawPath, 'utf-8')) as RawProduct[]

if (raw.length === 0) {
  console.error('种子数据为空：doc/products.json')
  process.exit(1)
}

const rows = raw.map((p) => ({
  sid: p.SID,
  name: p.SNAME,
  brand: p.STAG,
  price: p.PRICE,
  description: p.SCON,
  image: imageOverrides[p.SID] ?? null,
  legacyUrl: p.URL,
}))

db.delete(products).run()
db.insert(products).values(rows).run()

const count = db.select().from(products).all().length
console.log(`种子完成：入库 ${count} 条商品（清空重灌，幂等）`)
process.exit(0)
