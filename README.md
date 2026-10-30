# UGOShop 优品惠

Vue 3 + Fastify + Drizzle + SQLite 全栈实现的电商演示站（PC 端前台 + 管理后台）。

## 功能概览

**前台六页**：首页、商品列表、商品详情、登录、注册、购物车，全部为真实功能（REST 接口 + Pinia，无 mock 数据）。

**管理后台**：Element Plus 实现的 admin 端（与前台共用 Fastify + Drizzle 数据层），商品/分类/用户/订单四模块全部落地，后台改动（上下架/改价/库存/分类）前台列表与详情页实时可见——见文末「admin 管理端」一节。

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 轮播 + 大促楼层（AI 视觉资产）、分类菜单、关键词搜索 |
| 商品列表 | `/list` | 真分页（每页 6 条）+ 价格两态排序 + 销量/上架时间排序 + 分类过滤 |
| 商品详情 | `/item/:sid` | 放大镜、数量选择器、库存展示（随管理端编辑实时变化）、飞入购物车动画 |
| 登录 | `/login` | 服务端 scrypt 校验 + HttpOnly 签名会话 |
| 注册 | `/reg` | 即时唯一性检查、验证码（skew 变形/随机彩色） |
| 购物车 | `/cart` | 真后端购物车：加购/数量/删除/全选/总价/空车提示 |

部分展示位（面包屑文案、优惠标签、详情长图、评论数、大家都在看等）为静态展示内容。

## 快速开始

```bash
npm install      # .npmrc 已指向 npmmirror 公共镜像，不动全局配置
npm run db:push  # drizzle-kit 按 schema 建表（SQLite）
npm run seed     # doc/products.json 20 条商品 + 分类菜单入库（清空重灌，幂等）；管理员种子幂等创建
npm run dev      # 一条命令同时起前后台（server 3001 + app 5173）
npm run dev:admin # 单独起管理端 admin 5174（/api 与 /uploads 均代理至 server）
npm run build    # 生产构建（server tsc + app/admin 各自 vue-tsc & vite build）
```

- 开发前端 http://localhost:5173 （`/api` 经 Vite 代理转发后端，无需 CORS）
- 管理端 http://localhost:5174 （管理员账号 `admin / admin123456`，可用环境变量 `ADMIN_USERNAME`/`ADMIN_PASSWORD` 覆盖后重跑 seed）
- 开发后端 http://127.0.0.1:3001/api/health
- 生产预览 `npm run preview -w app`（4173 端口，已配 `/api` 代理；需先起 server）

注意：本机 Node 24 下 Vite 以 `localhost` 解析为 IPv6 单栈监听，请用 `http://localhost:5173` 访问，勿用 `127.0.0.1` 直连。

环境要求：Node ≥ 20（nvm4w 20.19.1 实测通过）。原生件 @libsql 为 napi 构建、经 npm 仓库分发，`npm install` 无需代理、无需本地编译，换 Node 大版本也不用重装。

## 接口一览（server，Fastify）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/products?page&pageSize&sort&order` | 分页商品（默认每页 6 条，`sort=price&order=asc/desc`） |
| GET | `/api/products/:sid` | 商品单查 |
| GET | `/api/menu` | 首页分类菜单 |
| GET | `/api/auth/check?username` | 注册即时唯一性检查 |
| POST | `/api/auth/register` | 注册（用户名 3-11 位小写字母数字，密码 ≥6 位，scrypt 哈希） |
| POST | `/api/auth/login` / `logout` | 登录（签名会话 30 天）/ 退出 |
| GET | `/api/auth/me` | 当前登录用户 |
| GET | `/api/cart` | 购物车列表 + 条目数（登录态） |
| POST | `/api/cart` | 加购 `{sid, quantity}`（已存在累加，登录态） |
| PATCH | `/api/cart/:sid` | 更新数量（登录态） |
| DELETE | `/api/cart/:sid` | 删除（登录态） |

admin 管理端接口（统一挂管理员会话守卫，与 C 端会话完全隔离）：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/auth/login` / `logout` / `me` | 管理端会话（独立 `admin_session` 签名 cookie；C 端登录态进 admin 一律 401） |
| GET/POST/PUT/DELETE | `/api/admin/products(/:sid)` | 商品全量 CRUD（含下架；新建 sid 自动 max+1） |
| PATCH | `/api/admin/products/:sid/status` | 上下架（1/0；C 端列表/详情即时过滤） |
| GET/POST/PUT/DELETE | `/api/admin/categories(/:id)(/items)` | 分类两级 CRUD（C 端 /api/menu 即时联动） |
| GET/POST/DELETE/PATCH | `/api/admin/users(/:id)(/password)` | 用户列表/新建/删除（admin 角色禁删）/scrypt 重置密码 |
| GET/DELETE | `/api/admin/orders(/:id)` | 订单（cart 表三表 JOIN + 全站统计） |
| POST | `/api/admin/upload` | 图片上传（base64 JSON，png/jpg/gif/webp ≤ 2MB，落盘 server/uploads/） |
| GET | `/uploads/*` | 静态托管上传文件（@fastify/static） |

## 目录结构

```
app/      Vue 3 + Vite + TS + Pinia + Vue Router（PC 端，不做移动端；全站自写轻量组件）
          src/views/     六个页面视图（Home/List/Item/Login/Reg/Cart）
          src/components 公共壳组件（TopBar/SiteHeader/CategoryNav/SideBar/SiteFooter/GoodsGallery）
          src/stores     auth / cart / menu / products（Pinia）
          src/styles     全站样式（首页/列表/详情/登录注册/购物车/放大镜）
admin/    Vue 3 + Vite + TS + Pinia + Vue Router + Element Plus（与 app 同栈）
          src/views/     login / dashboard / products / categories / users / orders 六页
          src/layouts    管理壳（深色侧边）
server/   Fastify + TS + Drizzle ORM + SQLite（@libsql/client，napi 二进制跨 Node 20/22/24）
          src/routes/    health / products / menu / auth / cart + admin/（auth/guard/products/categories/users/orders/upload）
          uploads/       管理端上传文件（运行时生成，@fastify/static 托管，不入版本库）
          scripts/seed.ts 商品与菜单种子 + 管理员账号（幂等；仅 insert-if-absent，绝不清空重灌 users）
assets/   视觉资产——AI 生成（banner/icon/product）+ 站内展示素材
          前端 publicDir 直指此处，单一素材源
doc/      商品种子数据（products.json）
          screenshots/  管理端页面截图
```

## 技术栈

- 前台：Vue 3 + Vite + TypeScript + Pinia + Vue Router（PC 端，不做移动端；组件全部手写）
- 管理端：同栈 + Element Plus（表格/表单/弹窗）
- 后端：Node.js + TypeScript + Fastify + Drizzle ORM + SQLite（@libsql/client）
- 运行：本地开发运行（dev / build / preview），不提供部署配置

## admin 管理端

与前台共用同一套 Fastify + Drizzle 数据层，模块划分：商品、分类、用户、订单。

| 模块 | 能力 | C 端联动 |
|------|------|----------|
| 登录 | scrypt + 独立 `admin_session` 签名会话（与 C 端会话完全隔离） | — |
| 商品 | 列表/搜索/筛选、新建（sid 自动分配）/编辑/删除、上下架开关、图片上传（png/jpg/gif/webp ≤ 2MB） | 下架 → 列表不可见、详情 404；改价/图/库存 → 详情实时变化 |
| 分类 | 两级 CRUD（categories + category_items） | `/api/menu` 即时联动（前台菜单） |
| 用户 | 列表（真 count）、新建、scrypt 重置密码、删除（级联购物车；admin 角色禁删防自锁） | — |
| 订单 | cart 三表 JOIN + 全站统计 | — |

**联动边界**：首页楼层（TV 直播/全球尖货/每日一品等）为构建期静态展示位，不随上下架实时变化；列表页与详情页走 `/api/products` 实时过滤 `status=1`。管理端页面截图见 `doc/screenshots/`。

