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

/**
 * 首页分类菜单。数据原样取自 museum 的 newMenu.js（2019-07-26 ad3fa4d），
 * icon 存原文件名（newsix_03.png 等），前端拼 /museum/css-img/ 前缀。
 */
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  icon: text('icon').notNull(),
  sort: integer('sort').notNull(),
})

export const categoryItems = sqliteTable('category_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull(),
  name: text('name').notNull(),
  sort: integer('sort').notNull(),
})
