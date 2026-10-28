# UGOShop 优品惠 — rebuild 分支

Vue 3 重构线。从 museum 纪念线分叉，旧实现已清场，本分支从零重建现代版。

## 当前状态

脚手架就绪；**首页已完成像素级复刻**（对照 museum 原版双开验证一致）。下一阶段：列表页 → 详情页 → 购物车。

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
npm run seed     # doc/products.json 20 条商品入库（清空重灌，幂等）
npm run dev      # 一条命令同时起双端
```

- 前端 http://localhost:5173 （`/api` 经 Vite 代理转发后端，无需 CORS）
- 后端 http://127.0.0.1:3001/api/health

注意：本机 Node 24 下 Vite 以 `localhost` 解析为 IPv6 单栈监听，请用 `http://localhost:5173` 访问，勿用 `127.0.0.1` 直连。

环境要求：Node ≥ 20（nvm4w 20.19.1 实测通过）。原生件 @libsql 为 napi 构建、经 npm 仓库分发，`npm install` 无需代理、无需本地编译，换 Node 大版本也不用重装。

## 目录结构

```
app/      Vue 3 + Vite + TS + Pinia + Vue Router + Element Plus（PC 端，不做移动端）
server/   Fastify + TS + Drizzle ORM + SQLite（@libsql/client，napi 二进制跨 Node 20/22/24）
assets/   视觉资产——AI 生成（banner/icon/product）+ museum 原版素材（/museum/，像素级复刻用）
          前端 publicDir 直指此处，单一素材源
doc/      需求底稿（PROJECT_SUMMARY / 当前功能列表 / 拯救计划 / products.json）
```

## 本分支内容

- `doc/PROJECT_SUMMARY.md` — 项目全貌（功能、接口契约、历史），重建期间的需求底稿
- `doc/当前功能列表.md` — 原版功能清单（注意：其中四处"已知 bug"经 2026-10 实测翻案，见 museum 分支提交记录）
- `doc/拯救计划.md` — 四档拯救方案，本线即其中方案 C 的执行
- `doc/products.json` — 商品数据 20 条（自 museum 的 mock-api.js 原样提取，含原图片路径引用）
- `assets/` — AI 生成的视觉资产（5 张大促 banner / 5 张功能图标 / 1 张翡翠手镯商品主图）
- `app/` + `server/` — 重写主体（server 已提供 `/api/health` 与 `/api/products`，后续按原接口契约扩展登录、购物车等）

## 技术选型（已定）

- 前端：Vue 3 + Vite + TypeScript + Pinia + Vue Router + Element Plus（PC 端，还原原站视觉基因；不做移动端）
- 后端：Node.js + TypeScript + Fastify + SQLite（@libsql/client，本地 file 模式即标准 SQLite 文件）+ Drizzle ORM（真后端一步到位）
- 部署：先纯本地开发，成品阶段再议（NAS 挂载 / 静态托管）

历史原点：2018 年 README 的重构计划——"初期使用 node.js 写接口"、"我都webpack了为什么不用vue"。这条分支就是当年那个未竟心愿的完工版。
