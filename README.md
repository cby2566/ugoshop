# UGOShop 优品惠 — rebuild 分支

Vue 3 重构线。从 museum 纪念线分叉，旧实现已清场，本分支从零重建现代版。

## 当前状态

清场完成，待脚手架。

## 分支格局

| 分支 | 定位 |
|------|------|
| `master` | 史料：2018-2022 合并态，冻结 |
| `museum` | 纪念线：2018 年代码原样复活（mock 数据层 + 免构建），只接受维护级小改 |
| `rebuild` | 本分支：Vue 3 现代重写 |

## 本分支内容

- `doc/PROJECT_SUMMARY.md` — 项目全貌（功能、接口契约、历史），重建期间的需求底稿
- `doc/当前功能列表.md` — 原版功能清单（注意：其中四处"已知 bug"经 2026-10 实测翻案，见 museum 分支提交记录）
- `doc/拯救计划.md` — 四档拯救方案，本线即其中方案 C 的执行
- `doc/products.json` — 商品数据 20 条（自 museum 的 mock-api.js 原样提取，含原图片路径引用）
- `assets/` — AI 生成的视觉资产（banner / 分类图标 / 商品主图）

## 技术选型（已定）

Vue 3 + Vite + TypeScript + Pinia + Vue Router + Element Plus（PC 端，还原原站视觉基因；不做移动端）。

历史原点：2018 年 README 的重构计划——"初期使用 node.js 写接口"、"我都webpack了为什么不用vue"。这条分支就是当年那个未竟心愿的完工版。
