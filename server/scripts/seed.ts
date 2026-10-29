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
  CATEGORY?: string | null
  SALES?: number
  CREATED_AT?: string
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

// AI 商品主图（assets/product/，前端经 publicDir 直取）。
// 图文匹配工程（2026-10-29）：13 件 AI 生成白底主图逐张视觉质检合格后接入；
// 贴 legacy 系列图的商品（8/10/11/13/18 → goods3~goods6 同一商品多角度系列）
// 不设 image，列表/相册沿用 legacyUrl 拼图；goods1/goods_midea 无 _1/_2/_3 系列
// 后缀，以 image 直指原图路径。
const imageOverrides: Record<number, string> = {
  1: '/museum/img/goods1.jpg',
  2: '/museum/img/goods_midea.jpg',
  3: '/product/beef-steak.jpg',
  4: '/product/buckwheat-pillow.jpg',
  5: '/product/leather-bag.jpg',
  6: '/product/jade-bracelet.jpg',
  7: '/product/goji-berry.jpg',
  9: '/product/jasmine-rice.jpg',
  12: '/product/cotton-bedding.jpg',
  14: '/product/bone-china.jpg',
  15: '/product/hair-care-set.jpg',
  16: '/product/thermo-cup.jpg',
  17: '/product/yellow-millet.jpg',
  19: '/product/pearl-necklace.jpg',
  20: '/product/storage-box.jpg',
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
  // D1/D2：分类（null=未分类）与销量/上架时间（ms 时间戳）
  category: p.CATEGORY ?? null,
  sales: p.SALES ?? 0,
  createdAt: p.CREATED_AT ? new Date(p.CREATED_AT).getTime() : 0,
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
