# UGOShop 优品惠 — rebuild 分支

Vue 3 重构线。从 museum 纪念线分叉，旧实现已清场，本分支从零重建现代版。

## 当前状态

**六页全部完成**（原站六页一一对应，均与 museum 双开对照做像素级验证）：首页、列表页、详情页、登录页、注册页、购物车。逻辑按「重写定案」做真功能，原版已知 bug 一律修正不在重建版复活。

**admin 管理端已接入（2026-10-29）**：以 2018 年配套后台 src-one 为蓝本重写（Element Plus + Fastify + Drizzle 同库），商品/分类/用户/订单四模块全部落地，后台改动（上下架/改价/库存/分类）前台列表与详情页实时可见——见文末「admin 管理端」一节。

| 原站页面 | rebuild 路由 | 说明 |
|----------|--------------|------|
| homepage.html | `/` | 像素级复刻；大促楼层为 AI 视觉资产 |
| foodList.html | `/list` | 真分页（每页 6 条）+ 价格两态排序（原版死代码复活并修正倒序页码 bug） |
| itemDetailed.html | `/item/:sid` | 放大镜（原 289 行插件行为等价重写）、数量选择器、库存展示（随管理端编辑实时变化）、飞入购物车动画 |
| login.html | `/login` | 服务端 scrypt 校验 + HttpOnly 签名会话（原版明文密码 + 立即过期 Cookie 的 bug 修正） |
| reg.html | `/reg` | 即时唯一性检查、验证码（skew 变形/随机彩色的趣味还原） |
| CarCar.html | `/cart` | 真后端购物车：加购/数量/删除/全选/总价/空车提示；原版 `ns-10` 硬编码与「全选只勾不取消」修正 |

**收尾已完成**：xnav「首页/食品」与 logo 接线；`vite preview` 配好 `/api` 代理；生产构建冒烟通过。

原版保留的静态展示位（面包屑文案、优惠标签、详情长图、评论数、大家都在看等）均按原样保留，见各视图文件头部注释。

## 分支格局

| 分支 | 定位 |
|------|------|
| `master` | 史料：2018-2022 合并态，冻结 |
| `museum` | 纪念线：2018 年代码原样复活（mock 数据层 + 免构建），只接受维护级小改 |
| `rebuild` | 本分支：Vue 3 现代重写 |

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
| GET/DELETE | `/api/admin/orders(/:id)` | 订单（cart 表三表 JOIN + 全站统计；沿袭 2018「car 即订单」语义） |
| POST | `/api/admin/upload` | 图片上传（base64 JSON，png/jpg/gif/webp ≤ 2MB，落盘 server/uploads/） |
| GET | `/uploads/*` | 静态托管上传文件（@fastify/static；P1 部分前置收编） |

## 目录结构

```
app/      Vue 3 + Vite + TS + Pinia + Vue Router（PC 端，不做移动端；Element Plus 已于第一批优化移除，全站自写轻量组件）
          src/views/     六个页面视图（Home/List/Item/Login/Reg/Cart）
          src/components 公共壳组件（TopBar/SiteHeader/CategoryNav/SideBar/SiteFooter/GoodsGallery）
          src/stores     auth / cart / menu / products（Pinia）
          src/styles     museum 编译 CSS 原样迁移（首页/列表/详情/登录注册/购物车/放大镜）
admin/    Vue 3 + Vite + TS + Pinia + Vue Router + Element Plus（2026-10 联动工程，与 app 同栈骨架）
          src/views/     login / dashboard / products / categories / users / orders 六页
          src/layouts    管理壳（菜单树取自 2018 src-one 左侧导航，深色侧边致敬 layui-bg-black）
server/   Fastify + TS + Drizzle ORM + SQLite（@libsql/client，napi 二进制跨 Node 20/22/24）
          src/routes/    health / products / menu / auth / cart + admin/（auth/guard/products/categories/users/orders/upload）
          uploads/       管理端上传文件（运行时生成，@fastify/static 托管，不入版本库）
          scripts/seed.ts 商品与菜单种子 + 管理员账号（幂等；仅 insert-if-absent，绝不清空重灌 users）
assets/   视觉资产——AI 生成（banner/icon/product）+ museum 原版素材（/museum/，像素级复刻用）
          前端 publicDir 直指此处，单一素材源
doc/      需求底稿（PROJECT_SUMMARY / 当前功能列表 / 拯救计划 / products.json / 优化清单）
          screenshots/  管理端六页截图存档（2026-10-29）
```

## 本分支内容

- `doc/PROJECT_SUMMARY.md` — 项目全貌（功能、接口契约、历史），重建期间的需求底稿
- `doc/当前功能列表.md` — 原版功能清单（注意：其中四处"已知 bug"经 2026-10 实测翻案，见 museum 分支提交记录）
- `doc/拯救计划.md` — 四档拯救方案，本线即其中方案 C 的执行
- `doc/products.json` — 商品数据 20 条（自 museum 的 mock-api.js 原样提取，含原图片路径引用）

## 技术选型（已定）

- 前端：Vue 3 + Vite + TypeScript + Pinia + Vue Router（PC 端，还原原站视觉基因；不做移动端；Element Plus 已移除）
- 管理端：同栈 + Element Plus（表格/表单/弹窗是 EP 主场；登录页致敬 2018 老后台蓝白配色）
- 后端：Node.js + TypeScript + Fastify + SQLite（@libsql/client，本地 file 模式即标准 SQLite 文件）+ Drizzle ORM（真后端一步到位）
- 部署：先纯本地开发，成品阶段再议（NAS 挂载 / 静态托管）

## admin 管理端（2026-10 联动工程）

蓝本为 2018 年的配套后台 **src-one**（Express + MySQL + LayUI，与前台同库同源）——不复活原代码，以其四模块为需求蓝本在现代栈重写。蓝本映射表与当年缺陷考古清单见 src-one 仓库 memorial 分支 `doc/联动方案.md`。

| 模块 | 能力 | C 端联动 |
|------|------|----------|
| 登录 | scrypt + 独立 `admin_session` 签名会话（与 C 端会话完全隔离） | — |
| 商品 | 列表/搜索/筛选、新建（sid 自动分配）/编辑/删除、上下架开关、图片上传（png/jpg/gif/webp ≤ 2MB） | 下架 → 列表不可见、详情 404；改价/图/库存 → 详情实时变化 |
| 分类 | 两级 CRUD（categories + category_items） | `/api/menu` 即时联动（前台菜单） |
| 用户 | 列表（真 count）、新建、scrypt 重置密码、删除（级联购物车；admin 角色禁删防自锁） | — |
| 订单 | cart 三表 JOIN + 全站统计（沿袭 2018「car 即订单」原始语义并注释留档） | — |

**联动边界（如实说明）**：首页楼层（TV 直播/全球尖货/每日一品等）为构建期静态展示位（N9 图文匹配工程绑定商品数据），不随上下架实时变化；列表页与详情页走 `/api/products` 实时过滤 `status=1`。管理端六页截图存档见 `doc/screenshots/`。

当年后台缺陷（SQL 字符串拼接、明文密码、分页假 count、上传只落盘不入库、后台零鉴权等 7 项）在重写中逐项修正并留档于 `server/src/routes/admin/` 各文件头注释。

## 重写定案（贯穿六页）

- 视觉像素级：布局/间距/配色/素材照 museum 编译 CSS 与 HTML 原样迁移（仅改素材路径），逐项盒模型测量对照
- 逻辑全重写：原版 ajax + jQuery 拼串、全局变量、四份复制函数一律淘汰，改 REST + Pinia + 组件化
- 安全：明文密码 → scrypt 哈希；签名 HttpOnly 会话（原版 Cookie 存用户名且 expires 传当前时刻实际存不住）；SQL 注入随 Drizzle 参数化天然消除
- 原版 bug 不复刻：倒序页码、`ns-10` 硬编码、`location.reload()`、全选只勾不取消、无效 alert 等已修正
- 原版灵魂交互保留：放大镜、飞入购物车动画、验证码 skew 变形、hover 展开的商品卡片「ping」层

历史原点：2018 年 README 的重构计划——"初期使用 node.js 写接口"、"我都webpack了为什么不用vue"。这条分支就是当年那个未竟心愿的完工版。