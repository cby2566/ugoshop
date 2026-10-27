# UGOShop 优品惠 — 项目回忆文档

> 生成时间：2026-07-22  
> 数据来源：基于实际源码功能分析 + 用户补充信息，不依赖注释或commit信息

---

## 1. 项目概况

| 项目 | 内容 |
|------|------|
| 项目名 | **UGOShop / 优品惠**（优购物） |
| 定位 | 电商网站（B2C 特卖平台） |
| 原型参考 | 北京优品惠网络科技有限公司的官网 (ugoshop.com) |
| 仓库地址 | https://github.com/cby2566/ugoshop.git |
| 代码周期 | **第一阶段（原型期）**：2018年11月 — 2019年4月<br>**第二阶段（第一次重构）**：2019年4月 — 2019年7月（进行到一半失败）<br>**第三阶段（第二次重构）**：2022年6月（失败） |
| README描述 | "重构计划" |

### 三个阶段的区别

| | 第一阶段（原型期） | 第二阶段（2019 第一次重构） | 第三阶段（2022 第二次重构） |
|---|---|---|---|
| 后端 | PHP + MySQL | 继续用 PHP（未动） | **计划放弃PHP，改用Node.js** |
| 前端 | jQuery 原生 + 直接引入JS/CSS | **引入Webpack + SASS**，尝试引入Vue | **计划迁移到Vue.js** |
| 构建 | 无构建工具 | Webpack 4（CSS/图片打包 → SASS编译 → dev-server） | 继续沿用，修复了 node-sass 版本问题 |
| 状态 | 功能完整，可运行 | 构建工具搭好，Vue迁移进行到一半失败 | 仅修复环境，业务代码未动 |

---

## 2. 技术栈

### 2.1 第一阶段（2018-2019，原型期）— 实际在代码中的技术

| 技术 | 用途 | 说明 |
|------|------|------|
| HTML5 | 页面结构 | 6个页面，传统多页应用(MPA) |
| jQuery 1.10.1 | DOM操作 / AJAX | 全程核心依赖，几乎所有交互都用jQuery |
| PHP (原生) | 后端接口 | 7个 .php 文件，无框架 |
| MySQLi | 数据库操作 | 面向过程风格 |
| MySQL | 数据存储 | 数据库名 `ugoshop`，本地 localhost/root/空密码 |

### 2.2 第二阶段（2019，第一次重构）— 在代码中实际引入的技术

| 技术 | 用途 | 说明 |
|------|------|------|
| Webpack 4 | 模块打包 | CSS/图片打包 → SASS编译 → dev-server 逐步引入 |
| SASS / SCSS | CSS预处理器 | 通过 sass-loader + node-sass 编译，替换原有CSS |
| Vue.js 2.6 | 尝试引入 | **进行了但未完成**，homepage.html 中写了Vue组件测试代码 |
| Babel | ES6转ES5 | 通过 babel-loader 配置 |

### 2.3 第三阶段（2022，第二次重构）— 计划中的技术（未完成）

根据 README "重构计划" 推断：

| 技术 | 用途 | 状态 |
|------|------|------|
| Vue.js | 前端框架 | **计划全面迁移**，2019年已尝试过，2022年继续 |
| Node.js | 替代 PHP 后端 | **计划中，未开始** |
| Webpack | 构建工具 | 已搭好，2022年修复了 node-sass 版本问题 |

### 2.3 构建工具

- `webpack.config.js` — 单入口 `home.js` → 输出到 `src/js/homepage/home.js`
- 加载器链：babel-loader → style-loader + css-loader + sass-loader → url-loader
- 开发服务器：`npm run server` → http://localhost:8089
- node-sass 版本敏感，需 nvm 切到 Node 10.24.1 才能正常编译

---

## 3. 项目目录结构

```
src/
├── index.html              # 入口页（自动跳转到 html/homepage.html）
├── api/                    # PHP 后端接口
│   ├── cont.php            # 数据库连接配置
│   ├── login.php           # 登录验证 + 用户注册
│   ├── car.php             # 购物车 CRUD（查/改/加/查数量）
│   ├── addCar.php          # 检查商品是否已在购物车
│   ├── del.php             # 删除购物车商品
│   ├── getfid.php          # 根据用户名获取用户ID(fid)
│   └── ulist2.php          # 商品列表查询（全部/分页/按ID）
├── html/                   # HTML页面
│   ├── homepage.html       # 首页（轮播图、限时购、分类促销）
│   ├── foodList.html       # 食品分类列表页（分页、排序）
│   ├── itemDetailed.html   # 商品详情页（放大镜、加购）
│   ├── CarCar.html         # 购物车页面
│   ├── login.html          # 登录页
│   └── reg.html            # 注册页
├── js/                     # 前端JS
│   ├── common.js           # 公共函数库（核心工具）
│   ├── iPublic.js          # 导航栏占位（几乎空）
│   ├── home.js             # 首页逻辑（轮播、登录状态、侧边栏）
│   ├── adNav.js            # 导航组件（ES6 export，实际为空壳）
│   ├── footList.js         # 商品列表页逻辑（排序、分页）
│   ├── car.js              # 购物车页逻辑（增删改、总价计算）
│   ├── item.js             # 商品详情页逻辑（放大镜、飞入购物车）
│   ├── login.js            # 登录+注册页逻辑（验证码、表单验证）
│   ├── module7.js          # ES6模块导出测试（export firstName）
│   └── homepage/           # webpack打包输出目录
├── css/                    # 编译后的CSS + 图片资源
├── sass/                   # SASS源码
│   ├── homepage.scss       # 首页样式
│   ├── homepage_main.scss  # 首页主体样式
│   ├── ADTextView.scss     # 广告文字样式
│   ├── car.scss            # 购物车样式
│   ├── foodList_main.scss  # 食品列表样式
│   ├── itemDetailed.scss   # 商品详情样式
│   ├── reg.scss            # 注册页样式
│   └── text.scss           # 文本样式
├── img/                    # 页面图片资源（商品图、banner、图标等）
└── lib/                    # 第三方库
    ├── jquery-1.10.1.min.js
    ├── jquery-addShopping.js   # 飞入购物车jQuery插件
    ├── mF/                     # myfocus轮播图插件（多种皮肤模板）
    │   └── mf-pattern/         # 各种轮播皮肤样式+JS
    └── cs.css                  # 自定义样式库
```

---

## 4. 页面路由与功能详情

### 4.1 首页 (homepage.html)
- **顶部公告栏**：滚动公告动画（gongg函数）
- **轮播图**：左右滑动 + 焦点指示器（sliderImg插件 / common.js）
- **TV直播区**：直播商品展示（静态HTML）
- **今日限时购**：倒计时 + 轮播商品列表
- **品类精选/全球尖货**：商品网格展示
- **侧边栏**：用户中心、购物车（带数量badge）、二维码、回到顶部
- **全局功能**：登录状态检测（Cookie）、购物车数量实时更新

### 4.2 食品分类列表页 (foodList.html + footList.js)
- 商品网格展示（每页6个）
- **价格排序**：点击价格标签升序/降序
- **分页**：上一页/下一页 + 页码跳转
- 商品点击 → 跳转商品详情页（带SID参数）

### 4.3 商品详情页 (itemDetailed.html + item.js)
- **放大镜效果**：图片hover放大（MagnifierF插件）
- **数量选择器**：+/- 按钮调整购买数量
- **加入购物车**：飞入动画效果 + AJAX提交
- **商品信息展示**：品牌、名称、价格、优惠信息、详情图
- 相关推荐区域

### 4.4 购物车页 (CarCar.html + car.js)
- 购物车列表渲染（从后端获取）
- 商品数量 +/- 调整（实时更新小计）
- **全选/反选** + 选中商品总价计算
- **满168包邮**提示
- 删除商品（AJAX + 页面刷新）
- 空购物车提示

### 4.5 登录页 (login.html + login.js)
- 用户名(手机号) + 密码登录
- AJAX验证用户名密码
- 登录成功 → Cookie存储用户名 → 跳转首页

### 4.6 注册页 (reg.html + login.js)
- 用户名（3-11位字母数字）+ 密码（≥6位）+ 确认密码
- **实时验证码**（随机4位：大小写字母+数字，skew变形 + 随机背景色）
- 用户名唯一性检查（AJAX查询）
- 表单全部验证通过 → AJAX提交注册

---

## 5. 数据库设计（从代码反推）

### 5.1 表结构

```
f_user（用户表）
├── fid      INT PK AUTO_INCREMENT   # 用户ID
├── fname    VARCHAR                  # 用户名（登录用）
└── fpws     VARCHAR                  # 密码（明文存储！）

ulist（商品表）
├── SID      INT PK                   # 商品ID
├── SNAME    VARCHAR                  # 商品名称
├── URL      VARCHAR                  # 图片路径前缀（如 "img/goods1"）
├── PRICE    INT/DECIMAL              # 价格
├── STAG     VARCHAR                  # 商品标签/品牌
├── SCON     TEXT                     # 商品描述
└── ... 其他字段

car（购物车表）
├── sid      INT                      # 商品ID (→ ulist.SID)
├── fid      INT                      # 用户ID (→ f_user.fid)
└── sum      INT                      # 购买数量
```

### 5.2 表关系

- `f_user` 1:N `car`（一个用户多个购物车条目）
- `ulist` 1:N `car`（一个商品可被多个用户的购物车引用）
- 购物车通过用户名(fname)关联用户（而非fid），查询时用子查询

---

## 6. 公共工具库 (common.js) — 核心功能

### 6.1 工具函数
| 函数 | 功能 |
|------|------|
| `randomNum(min, max)` | 生成范围内随机整数 |
| `getid(id)` | 按ID获取DOM元素 |
| `filterTex(str)` | 敏感词过滤（替换为\*\*） |
| `randomColor(str)` | 生成随机颜色（16进制或rgb） |
| `setDb(num)` | 数字补零（<10补前导0） |
| `setTime(diffTime)` | 毫秒 → 天/时/分/秒 |
| `strToObj(str)` | 查询字符串 → JS对象 |
| `objToStr(obj)` | JS对象 → 查询字符串 |
| `bind(ele, type, fn)` | 事件监听兼容封装 |
| `getstyle(obj, name)` | 获取元素计算样式（兼容IE8-） |
| `startMove(obj, json, fnend)` | **自定义缓动动画框架**（多属性、多对象、链式） |
| `extendObj(obj1, obj2)` | 对象合并（覆盖） |
| `cloneDeep(obj)` | 深拷贝（JSON序列化方式） |
| `ajax(method, url, data, success)` | AJAX封装（GET/POST） |

### 6.2 表单验证 (checkReg)
| 方法 | 功能 | 正则规则 |
|------|------|---------|
| `checkReg.trim(str)` | 去除首尾空格 | `^\s+\|\s+$` |
| `checkReg.tel(str)` | 手机号 | `^1[3-9]\d{9}$` |
| `checkReg.email(str)` | 邮箱 | 标准邮箱正则 |
| `checkReg.idcard(str)` | 身份证 | `^(\d{17}\|\d{14})[\dX]$` |
| `checkReg.psweasy(str)` | 密码（字母开头6-18位） | `^[a-zA-Z]\w{5,17}$` |
| `checkReg.pwwagain(str1, str2)` | 密码确认 | 全等比较 |
| `checkReg.urladr(str)` | URL | 域名格式正则 |
| `checkReg.name(str)` | 账号（字母开头6-20位） | `^[a-zA-Z][\w\-]{5,19}$` |
| `checkReg.chinese(str)` | 纯中文 | `^[⺀-鿿]+$` |
| `checkReg.birthday(str)` | 日期 | 复杂日期校验正则 |

### 6.3 Cookie 工具 (Cookie)
| 方法 | 功能 |
|------|------|
| `Cookie.set(name, value, prop)` | 设置cookie（支持expires/path/domain） |
| `Cookie.get(key)` | 读取cookie |
| `Cookie.remove(key)` | 删除cookie（设置过期时间） |

### 6.4 轮播图插件 (sliderImg)
- 自动轮播（2秒间隔）
- 鼠标悬停暂停 / 离开继续
- 上下按钮手动切换
- 焦点指示器点击跳转
- 方向感知（从左边切入 vs 右边切入）
- 基于自定义 `startMove` 动画框架

---

## 7. 后端接口详情

### 7.1 cont.php — 数据库连接
```
主机: localhost
用户: root
密码: （空）
数据库: ugoshop
编码: utf8
```

### 7.2 login.php — 认证接口
| 请求 | 参数 | 返回 | 功能 |
|------|------|------|------|
| GET | fname | "yes"/"no" | 检查用户名是否存在（同时返回密码） |
| GET | fname + psw | "ok" | 注册新用户（INSERT） |

**注意**：密码明文比对，SQL拼接无预处理

### 7.3 car.php — 购物车接口
| flag | 参数 | 功能 |
|------|------|------|
| g | fid(用户名) | 获取用户购物车列表（JOIN查询） |
| jia | fid + x + yoy | 更新商品数量 |
| y | x(用户名) | 检查用户购物车中商品数量 |
| news | fid + x + yoy | 新增购物车条目 |

### 7.4 ulist2.php — 商品接口
| flag | 参数 | 功能 |
|------|------|------|
| s | 无 | 获取所有商品 |
| i | id | 按商品ID获取单个商品详情 |
| d | page | 分页获取商品（每页6个，LIMIT） |

### 7.5 addCar.php — 加购检查
| 参数 | 功能 |
|------|------|
| flag(用户名) + sid | 检查某商品是否已在用户购物车中 |

### 7.6 del.php — 删除购物车
| 参数 | 功能 |
|------|------|
| fid + sid | DELETE FROM car WHERE sid=... AND fid=... |

### 7.7 getfid.php — 获取用户ID
| 参数 | 功能 |
|------|------|
| fname | SELECT fid FROM f_user WHERE fname=... |

---

## 8. 前端架构分析

### 8.1 全局状态管理（Cookie-based Session）
```
用户登录 → Cookie.set('name', 用户名, new Date())
各页面初始化 → 检测 Cookie.get('name')
  ├── 有 → 显示用户名 + "退出"按钮 + 购物车badge
  └── 无 → 显示"注册"/"登录"链接
退出 → Cookie.remove('name') → 刷新页面
```

### 8.2 登录状态共享模式（4个页面重复代码）
`ddenglul()` 函数在 **home.js、car.js、item.js、footList.js** 中重复定义：
- 检测 Cookie 中用户名
- AJAX查询购物车数量 → 更新 `.mycart span` 和 `.go_wu_che`
- 绑定退出点击事件

### 8.3 侧边栏交互（3个页面重复代码）
`cbl()` 函数在 **home.js、car.js、item.js、footList.js** 中重复：
- 鼠标悬停显示对应功能提示
- 点击购物车图标 → 跳转购物车
- 点击向上 → 回到顶部

### 8.4 购物车badge同步
每个页面都通过 `car.php?flag=y&x=用户名` 实时查询购物车商品数量

---

## 9. 已知问题和值得注意的地方

### 9.1 安全问题（代码实际行为）
1. **SQL注入**：所有PHP接口直接拼接 `$_GET` 参数到SQL，无预处理
2. **明文密码**：`fpws` 字段存储明文密码，登录时直接 `echo` 密码比对
3. **无CSRF防护**：所有操作通过GET请求
4. **XSS风险**：商品名称直接插入HTML（如 `car.js` 的模板字符串）

### 9.2 代码质量问题
1. **全局变量污染**：`fid`、`$data`、`arrImg`、`item_sum`、`sssid`、`newcl`、`yoy` 等大量全局变量
2. **变量声明重复**：`car.js` 中 `var fid` 声明了两次（全局 + 函数内），`fid` 在 `xun()` 中被从数据覆写
3. **代码重复**：`ddenglul()`、`cbl()`、`lcar()` 在4个页面中完全复制粘贴
4. **命名不规范**：`jj='-'`、`yoy`、`asd`、`xi`、`jj` 等无意义变量名
5. **注释与代码不符**：如 `login.php` 注释说"做真正的数据接口"但功能是登录
6. **死代码**：`home.js` 的 `fnuxn()`/`gongg()` 函数写好了但 jQuery ready 中注释掉了；`footList.js` 的 `ahj()`/`ahj2()` 分页函数定义好了但未调用
7. **无错误处理**：AJAX没有 error 回调，PHP 没有 try-catch
8. **eval()使用**：`footList.js` 的排序函数用 `eval()` 拼接字符串比较价格（`eval(jj+a['PRICE']+'+'+b['PRICE'])`）
9. **购物车计算bug**：`car.js` 中 `ns-10` 硬编码减10元（可能是"TV商品立减"逻辑残留，但通用计算不应这样写）
10. **参数传递错误**：`item.js` 的 `dang_goods()` 中，加购 AJAX 请求用 `location.search.substring(4)` 提取商品ID，但 `substring(4)` 会截掉 `id=` 的前两个字符，实际传入的是错误的值
11. **删除接口参数硬编码**：`car.js` 的 `dels()` 函数中 AJAX 请求 `flag=jia`，但 `del.php` 后端不使用 flag 参数，纯属写错了

### 9.3 未完成/缺失的功能和死链接

#### 缺失的功能
1. **搜索功能**：首页搜索框有UI（`.schin` 输入框 + 搜索按钮）但无任何JS逻辑
2. **分类导航**：导航栏分类链接（食品、家居、美妆等）全是 `javascript:void(0)`，未实现跳转
3. **TV直播**：TV直播区是纯静态HTML（3个相同的商品卡片），无动态数据
4. **轮播图依赖**：`lib/mF/` 整个 myfocus 插件目录（约30+文件）被引入但从未使用，实际用的是自己写的 `sliderImg`
5. **分页组件**：`footList.js` 的 `ahj2()` 定义了完整的分页逻辑但被注释掉了调用，`#P_fan` 元素在HTML中也不存在
6. **放大镜插件**：`lib/js.js` 包含完整的 `MagnifierF` 实现（约350行，原生JS IIFE 写法，支持鼠标拖拽放大 + 缩略图切换），功能正常

#### 死链接（href指向不存在的文件）
1. **login.html 顶部导航**：`<li><a href="foodList.html">注册</a>` — "注册"链接指向食品列表页，应该是 `reg.html`，明显写错了
2. **login.html 底部**：`<a href="user.php?act=register">免费注册</a>` — `user.php` 在项目中不存在
3. **login.html 底部**：`<a href="activeuser.php">快速激活</a>` — `activeuser.php` 在项目中不存在
4. **多个页面顶部导航**：`我的订单`、`我的关注`、`资讯`、`品牌馆` 全部是 `javascript:void(0)`
5. **注册页顶部导航**：同 login.html，链接也有问题

#### 脚本加载顺序问题
1. **homepage.html**：`<script src="../js/common.js"></script>` 在 `<script src="../lib/jquery-1.10.1.min.js"></script>` **之前**加载。目前不报错是因为 `common.js` 中的函数（`randomNum`、`Cookie`、`ajax` 等）本身不依赖 jQuery，只有 `sliderImg` 依赖 `startMove`（也不依赖 jQuery）。但如果将来在 `common.js` 中加了 jQuery 调用，会出问题
2. **itemDetailed.html**：加载顺序正确（jQuery → common.js → item.js）

### 9.4 无法从代码确定的问题

以下问题仅凭代码无法确定原作者的意图，翻 commit 记录也无法还原思路（因为 commit 信息太简单），标注为**不可考**：

#### 1. `jquery-addShopping.js` 的 `location.reload()`
飞入动画结束后强制刷新整个页面。从代码逻辑推断，是为了刷新购物车 badge 数字（`.mycart span`），但这是极差的用户体验。**原因不可考**。

#### 2. `item.js` 的 `getfid()` 中硬编码 `'123'`
```js
data: {'fname': '123'}  // 第236行
```
`getfid.php` 根据用户名查 `fid`，但这里传了固定值 `'123'`。从后续代码看，`sssid` 被赋值为返回的 fid，然后 `dang_goods()` 用它来加购。如果是调试残留，正常逻辑应该传 `Cookie.get('name')`。**原因不可考**。

#### 3. `text.scss` 文件
```scss
div{
    width: 100px;
    height: 100px;
}
```
全局强制所有 `div` 为 100×100 像素。如果被 import 会破坏所有页面布局。当前未被任何文件引用，疑似测试文件。**存在意义不可考**。

#### 4. `footList.js` 分页函数为何被注释
`ahj()`（初始化加载）和 `ahj2()`（分页）函数代码完整但 jQuery ready 中调用被注释。`#P_fan` 元素在 HTML 中也不存在。**原因不可考**。

---

## 10. 开发历程还原

### 第一阶段：原型开发（2018-11 至 2019-04）

| 时间 | 活动 | 说明 |
|------|------|------|
| 2018-11-24 | 首次提交 | 项目启动，基础HTML结构 |
| 2018-11-29 | 详情页 + 购物车 | 核心电商功能（商品详情、购物车CRUD） |
| 2018-11-30 | 注册/登录页 | 表单验证、验证码、AJAX认证 |
| 2018-12-01 | 完善加购/飞入动画 | 购物车完整闭环，加购飞入效果 |
| 2019-03-23 | `重构计划` | **第一次重构念头萌生**，README开始写"重构计划" |
| 2019-04-11 | 添加css和图片打包 | **第一次重构开始**：引入Webpack，配置css-loader + url-loader |
| 2019-04-21 | 添加sass转换、dev服务器 | 继续重构：引入sass-loader + webpack-dev-server，但遇到JS路径问题 |
| 2019-05 | 合并冲突 | git pull 合并冲突 |
| 2019-07-15 | `我都webpack了为什么不用vue` | **重构进行到一半**：Webpack和SASS已搭好，开始尝试Vue，但Vue迁移没有真正落地 |

**第一阶段失败原因**（推断）：Webpack构建工具链搭好了，但要把整个jQuery多页应用改造成Vue组件，当时的水平做不到，遂搁置。

### 第二阶段：第二次重构（2022-06，未完成）

| 时间 | 活动 | 说明 |
|------|------|------|
| 2022-06-20 | `reset 重新启动` | 卷土重来，目标：彻底重构，放弃PHP，迁移到Vue + Node.js |
| 2022-06-20 | 修复 node-sass | 遇到 node-sass 版本兼容问题，用 nvm 切到 Node 10.24.1 解决 |
| 2022-06-20 | 少量代码调整 | homepage.html 和 home.js 加了几个注释和setTimeout测试 |
| ~~之后~~ | **项目再次搁置** | 技术水平仍不足以完成从 PHP+jQuery 到 Vue+Node.js 的全栈迁移 |

**2022年重置时的真实状态**：代码库和2019年相比几乎没有任何业务改动。

**第二次失败原因**（推断）：
- 2019年的第一次重构已经把代码引入了"半Webpack半原生"的不伦不类状态
- 要从头迁移到Vue + Node.js全栈，意味着要推翻之前所有的工作
- PHP接口（7个文件）需要全部用Node.js重写
- jQuery的DOM操作 + 模板字符串需要全部改为Vue组件
- 从零搭建Vue + Vue Router + Node.js全栈项目的门槛仍然超出当时的能力

---

## 11. 技术路线演变

### 第一阶段：原型期（2018-11 至 2019-04）

```
原生PHP + 直接引入JS/CSS（无构建工具）
    ↓
引入jQuery（AJAX + DOM操作）
    ↓
完成电商核心功能（注册→登录→浏览→加购→购物车）
```

### 第二阶段：第一次重构（2019-04 至 2019-07，进行到一半失败）

```
jQuery 多页应用 + 无构建工具
    ↓
引入 Webpack（CSS/图片打包）
    ↓
引入 SASS 编译 + dev-server 热更新
    ↓
尝试引入 Vue.js（"我都webpack了为什么不用vue"）
    ↓  ← 在这里卡住了，失败
```

**第一次重构的成果**：Webpack + SASS 构建工具链成功跑通  
**第一次重构的瓶颈**：Vue 组件化迁移没有真正落地，jQuery代码和Vue代码无法平滑共存

### 第三阶段：第二次重构（2022-06，失败）

```
jQuery 多页应用 + Webpack + PHP（半重构状态）
    ↓  目标：全面推翻重来
Vue.js 单页应用 + Node.js 后端
```

**第二次重构的瓶颈**：
- 2019年已经引入了Webpack但业务代码还是jQuery，处于"半重构"的尴尬状态
- 要从头迁移到Vue + Node.js全栈，意味着要推翻之前所有的工作
- PHP 接口需要全部重写（7个文件）
- jQuery 的 DOM 操作 + 模板字符串需要全部改为 Vue 组件
- Cookie-based 全局状态需要改为 Vuex / Pinia
- 多页应用 → 单页应用的路由体系重构

---

## 12. 总结

### 第一阶段（2018-2019）：学习型电商项目

这是一个典型的**初学者全栈练手项目**，特点是：
- 完整的前后端全栈实现（HTML+JS+PHP+MySQL）
- 实现了电商核心流程：注册→登录→浏览商品→加购→购物车管理
- 代码风格是先跑通功能，结构和规范后续再说
- 没有构建工具，直接浏览器打开PHP文件运行
- 安全和健壮性有明显短板，适合学习但不适合生产

### 第二次重构失败（2019，第一次重构尝试）

2019年你意识到纯原生开发效率太低，开始**第一次重构**：

- **成果**：成功引入 Webpack 构建工具链（CSS/图片打包 → SASS编译 → dev-server热更新）
- **尝试**：开始引入 Vue.js（commit信息："我都webpack了为什么不用vue"）
- **失败原因**：jQuery多页应用的代码耦合度太高，无法平滑迁移到Vue组件化。Webpack搭好了，但业务代码的Vue迁移卡住了

### 第三次重构失败（2022，第二次重构尝试）

2022年又试了一次，结果更糟：

- **目标**：放弃PHP，全面迁移到 Vue + Node.js 全栈
- **实际进展**：仅修复了 node-sass 编译环境问题，业务代码几乎没动
- **失败原因**：2019年已经把代码引入了"半Webpack半原生"的尴尬状态，要从头推翻迁移到全新技术栈，门槛超出了当时的能力

**这个项目的本质**：三次失败的重构尝试，折射出一个前端学习者的典型成长轨迹——从原生jQuery → 想用构建工具 → 想用现代框架 → 最终发现需要系统性的知识储备才能完成架构迁移。
