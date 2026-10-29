import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * 商品表。字段映射自原 mock-api.js 的 ulist 契约（doc/products.json 为底稿）：
 * SID→sid, SNAME→name, STAG→brand, PRICE→price, SCON→description, URL→legacyUrl
 * D1：category 列表页分类（对齐 6 个频道 tab，null=未分类）；
 * D2：sales=销量、createdAt=上架时间戳（ms），供列表页排序维度。
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
  category: text('category'),
  sales: integer('sales').notNull().default(0),
  createdAt: integer('created_at').notNull().default(0),
  /**
   * 管理端字段（2026-10-29 admin 联动批次 1）：对应原版 ulist.DIAN（1 上架 / 2 下架），
   * 归一化为 1/0；REPE 语义不可考（疑库存），按库存使用。
   * C 端列表/单查过滤 status=1（后台下架 → 前台不可见），随 admin 批次 2 接入。
   */
  status: integer('status').notNull().default(1),
  stock: integer('stock').notNull().default(0),
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

/**
 * 用户表。字段映射自原 f_user 契约：fid→id、fname→username、fpws→password。
 * 原版密码明文存储且接口直接返回明文比对；重写定为 scrypt 哈希（salt:hex 格式）。
 * role（2026-10-29 admin 联动批次 1）：当年 f_user 同表混管前台注册用户与
 * 后台登录（login.js 仅查 status=1），重写以 role 区分；管理员由种子脚本创建。
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
})

/**
 * 购物车表。字段映射自原 car 契约：fid→user_id（改存 users.id）、sid→sid、sum→quantity。
 * 原版按用户名子查询关联用户、向 car 表插入/更新，重写按 (user_id, sid) upsert 语义。
 */
export const cart = sqliteTable('cart', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  sid: integer('sid').notNull(),
  quantity: integer('quantity').notNull(),
})
