import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { db } from '../src/db/index.js'
import { categories, categoryItems, products } from '../src/db/schema.js'

interface RawProduct {
  SID: number
  SNAME: string
  STAG: string
  PRICE: number
  URL: string
  SCON: string
}

// 首页分类菜单（原样取自 museum 的 newMenu.js，2019-07-26 ad3fa4d）
const MENU_DATA: { title: string; item: string[]; icon: string }[] = [
  { title: '品质厨房', item: ['厨房烹饪', '厨房电器', '餐饮用具', '厨房配件'], icon: 'newsix_03.png' },
  { title: '美食·民生', item: ['进口食品', '营养保健', '休闲食品', '粮油干货', '酒水茶饮', '生鲜食品'], icon: 'newsix_05.png' },
  { title: '健康生活', item: ['优质睡眠', '收纳用品', '生活用品', '生活电器', '装饰/家居', '健身/户外', '医疗器械'], icon: 'newsix_07.png' },
  { title: '魅力穿戴', item: ['男装', '女装', '内衣', '箱包', '鞋子', '配饰', '户外鞋服'], icon: 'newsix_09.png' },
  { title: '珠宝收藏', item: ['翡翠玉石', '宝石珍珠', '水晶玛瑙', '时尚饰品', '钟表', '文化收藏'], icon: 'newsix_13.png' },
  { title: '美肤靓妆', item: ['面部护理', '洗护护理', '美容仪器', '身体护理', '彩妆香水'], icon: 'newsix_11.png' },
]

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

await db.delete(products)
await db.insert(products).values(rows)

// —— 分类菜单入库 ——
await db.delete(categoryItems)
await db.delete(categories)
for (let i = 0; i < MENU_DATA.length; i++) {
  const m = MENU_DATA[i]
  const inserted = await db.insert(categories).values({ title: m.title, icon: m.icon, sort: i }).returning()
  const catId = inserted[0].id
  const itemRows = m.item.map((name, j) => ({ categoryId: catId, name, sort: j }))
  await db.insert(categoryItems).values(itemRows)
}

const count = (await db.select().from(products)).length
const catCount = (await db.select().from(categories)).length
console.log(`种子完成：入库 ${count} 条商品、${catCount} 组分类菜单（清空重灌，幂等）`)
process.exit(0)
