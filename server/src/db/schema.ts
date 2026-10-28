import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * 商品表。字段映射自原 mock-api.js 的 ulist 契约（doc/products.json 为底稿）：
 * SID→sid, SNAME→name, STAG→brand, PRICE→price, SCON→description, URL→legacyUrl
 */
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sid: integer('sid').notNull().unique(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  price: integer('price').notNull(),
  description: text('description').notNull(),
  image: text('image'),
  legacyUrl: text('legacy_url'),
})
