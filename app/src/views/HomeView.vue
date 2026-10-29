<!--
  首页主体（原站 homepage.html .scroll_tu + #webmain 原样移植）。
  与原站的有意差异（其余像素级照搬）——2026-10 起本分支按「新站优化」方向演进，
  不再受原站 HTML/JS 缺陷束缚（原站 fnuxn()/gongg() 调用均被注释、从未生效）：
  - 主轮播：原站 myfocus 焦点图自始被注释、呈现为静态单图，此处按设计意图
    以 luntu1-5 五图自动淡入轮播等效还原（素材实为 1920×340，原站顶格显示）
  - 今日限时购小卡 d_prev/d_next：接上原站未接线的 fnuxn 意图，并修正步进为
    -480px（2×240px 数学对齐，原值 -473 会致第二屏起点偏 8px、右缘裁 8px）；
    卡片渲染两份共 8 张实现两屏各满 3 张无缝切换（仿公告回绕手法）
  - 今日限时购倒计时：接上原站从未驱动的走秒（归零后重置 24:00:00 常活）
  - 今日限时购左卡（每日一品）排版修正：原站白卡内容高 339 > 307 溢出 17px，
    价格压在渐变红底上且被「立减」标签遮挡，「每日一品」徽章压商品图 logo，
    全部在增补样式中修正（见文末 style 注释）
  - 全球尖货 .item_img 背景为失效外链，已在移植 CSS 内本地等效替换
  新站化（N1/N2/N4，2026-10）：
  - TV 直播区：原站三卡同文同图（双立人文案 + ￥2998 + 家纺场景图，图文不匹配），
    且倒计时 20:20:20 静态不走；现取 3 件真商品差异化，倒计时接走秒（复用
    限时购逻辑），卡片点击跳详情；
  - 全球尖货：原站四卡一品玉红枣完全重复 + 「1970已购买」数字突兀，现为
    2 行 8 卡网格（grid 4 列等分），已购买数取真实销量，卡片点击跳详情；
  - 品类促销：原站仅标题空模块，补 6 个品类入口卡（复用列表页分类 icon 素材），
    点击跳 /list?category=；
  - 图文匹配工程（2026-10-29）：楼层卡图与商品主图同源（products.json 的
    image / legacyUrl），TV 三卡（蜂蜜/挂烫机/翡翠）、尖货八卡（香米/珍珠/
    巧克力/燕麦/饼干/果酱/牛排/小方包）、每日一品（goods_midea 实为挂烫机，
    文案由原站「SKG 养生壶」错配改为贴图）、限时购小卡（goods1 实为黑巧
    克力，文案由原站「干洗剂」错配改为贴图）全部图文一致；
  - 今日限时购排版（左卡布局 + 小卡两屏轮播 + 倒计时走秒）为 1a47646 已修
    部分，结构保持原样。
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// —— 主轮播（luntu1-5，对应原站五张焦点图素材）——
// I5：加指示圆点（点击切帧）+ 悬停暂停/移开恢复；prefers-reduced-motion 下停用自动轮播
const banners = [1, 2, 3, 4, 5].map((n) => `/museum/img/luntu${n}.jpg`)
const current = ref(0)
let timer: number | undefined
const hoverPaused = ref(false)

function goSlide(i: number) {
  current.value = i
}

function startAuto() {
  stopAuto()
  timer = window.setInterval(() => {
    if (!hoverPaused.value) current.value = (current.value + 1) % banners.length
  }, 3500)
}

function stopAuto() {
  window.clearInterval(timer)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  startAuto()
})
onBeforeUnmount(() => stopAuto())

// —— 今日限时购小卡轮播（fnuxn 意图，两屏切换）——
// 步进 -480 = 2×240（单卡布局步进 240：盒宽 241 含 border-left 1，相邻卡以
// margin-left:-1 重叠边线，故步进为 240 而非 241），第二屏起点与第一屏完全同位；
// 卡片渲染两份（后份仅作回绕、aria-hidden），两屏各满 3 张
const cardLoop = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (n > 4 ? n - 4 : n))
const LUN_STEP = -480
const lunLeft = ref(0)
function toggleLun() {
  lunLeft.value = lunLeft.value === 0 ? LUN_STEP : 0
}

// —— 今日限时购倒计时（原站硬编码 18:23:01 从未走秒，接上归零重置 24h 常活）——
const DAY = 24 * 3600
const remain = ref(18 * 3600 + 23 * 60 + 1)
let remainTimer: number | undefined
const pad = (n: number) => String(n).padStart(2, '0')
const dHour = computed(() => pad(Math.floor(remain.value / 3600)))
const dMinute = computed(() => pad(Math.floor((remain.value % 3600) / 60)))
const dSecond = computed(() => pad(remain.value % 60))

onMounted(() => {
  remainTimer = window.setInterval(() => {
    remain.value = remain.value > 0 ? remain.value - 1 : DAY
  }, 1000)
})
onBeforeUnmount(() => window.clearInterval(remainTimer))

// —— N1：TV 直播倒计时（原站硬编码 20:20:20 从未走秒，复用限时购逻辑：每秒递减、归零重置 24h 常活）——
const tvRemain = ref(20 * 3600 + 20 * 60 + 20)
let tvTimer: number | undefined
const tvTimeText = computed(
  () => `${pad(Math.floor(tvRemain.value / 3600))}:${pad(Math.floor((tvRemain.value % 3600) / 60))}:${pad(tvRemain.value % 60)}`,
)
onMounted(() => {
  tvTimer = window.setInterval(() => {
    tvRemain.value = tvRemain.value > 0 ? tvRemain.value - 1 : DAY
  }, 1000)
})
onBeforeUnmount(() => window.clearInterval(tvTimer))

// —— N1/N2：楼层真商品数据（取自 doc/products.json，展示位静态定义，不额外发请求）——
// 图文匹配工程（2026-10-29）：楼层图与商品主图一一对应（products.json 的
// image/legacyUrl 同源），消除原站「楼层图与商品无关」的硬编码图文错配；
// 选品避开同页跨楼层重复（TV 3 件、尖货 8 件互不重叠）
// —— TV 直播卡（中高价大件贴 TV 购物调性）
const tvShows = [
  { sid: 10, name: '新西兰麦卢卡蜂蜜 250g×3罐', price: 529,  img: '/museum/img/goods3_1.jpg' },
  { sid: 2,  name: '美的立式蒸汽挂烫机 香芋紫',  price: 399,  img: '/museum/img/goods_midea.jpg' },
  { sid: 6,  name: '天然冰种飘花翡翠手镯',        price: 1299, img: '/product/jade-bracelet.jpg' },
]
// —— 全球尖货：8 卡 2 行 4 列网格（用户需求）；选品全为进口/全球品牌贴楼层
// 调性，已购买数取真实 sales；图与商品主图同源，「直降」标签保持第 2 卡位置
const globalGoods = [
  { sid: 9,  name: '泰国茉莉香米 10斤装',              price: 79,  img: '/product/jasmine-rice.jpg',  abstract: '泰国原装进口 茉莉香米',        purchased: 1880, tag: '',    regular: 95 },
  { sid: 19, name: '淡水珍珠项链 7.5-8mm 正圆强光',    price: 899, img: '/product/pearl-necklace.jpg', abstract: '正圆强光珍珠 附分级证书',    purchased: 145,  tag: '直降', regular: 1099 },
  { sid: 1,  name: '奥地利 Zotter 100% 黑巧克力排块',   price: 79,  img: '/museum/img/goods1.jpg',     abstract: '奥地利进口 100%秘鲁可可',   purchased: 1280, tag: '',    regular: 99 },
  { sid: 18, name: '新西兰进口亚麻籽即食燕麦片 500g',  price: 89,  img: '/museum/img/goods2_1.jpg',    abstract: '新西兰原产 低GI代餐',       purchased: 630,  tag: '',    regular: 109 },
  { sid: 11, name: '英国 Go ahead 酸奶涂层夹心饼干',    price: 128, img: '/museum/img/goods6_1.jpg',    abstract: '英国进口 酸奶涂层夹心',      purchased: 980,  tag: '',    regular: 159 },
  { sid: 13, name: 'BEBE 特级草莓果酱 340g',            price: 59,  img: '/museum/img/goods5_1.jpg',    abstract: '57%高果肉含量 进口果酱',    purchased: 1320, tag: '',    regular: 79 },
  { sid: 3,  name: '进口澳洲安格斯原切牛排 10片装',    price: 158, img: '/product/beef-steak.jpg',   abstract: '原肉整切 冷链直达',          purchased: 2140, tag: '',    regular: 199 },
  { sid: 5,  name: '女士真皮单肩小方包 酒红色',        price: 499, img: '/product/leather-bag.jpg',  abstract: '头层牛皮 复古五金件',        purchased: 320,  tag: '',    regular: 599 },
]

// —— N4：品类促销入口（原站空模块，补 6 个频道分类卡，icon 素材同列表页 tab）——
const promoCats = [
  { icon: '/museum/img/icon_a_93.png',   title: '进口食品' },
  { icon: '/museum/img/icon_a_829.png',  title: '营养保健' },
  { icon: '/museum/img/icon_a_364.png',  title: '休闲食品' },
  { icon: '/museum/img/icon_a_959.png',  title: '粮油干货' },
  { icon: '/museum/img/icon_a_822.png',  title: '酒水茶饮' },
  { icon: '/museum/img/icon_a_1245.png', title: '生鲜食品' },
]

// 楼层卡跳详情 / 品类入口跳列表分类过滤（与列表页 tab、详情页面包屑同一 query 契约）
function goDetail(sid: number) {
  void router.push(`/item/${sid}`)
}
function goCategoryList(title: string) {
  void router.push({ path: '/list', query: { category: title } })
}
</script>

<template>
  <!-- 轮播图 -->
  <div
    class="scroll_tu"
    id="scroll_tu"
    @mouseenter="hoverPaused = true"
    @mouseleave="hoverPaused = false"
  >
    <ul class="ugoshop-carousel">
      <li v-for="(b, i) in banners" :key="b" :class="{ on: i === current }">
        <img :src="b" alt="" />
      </li>
    </ul>
    <!-- I5：指示圆点 -->
    <ul class="ugoshop-carousel-dots">
      <li
        v-for="(b, i) in banners"
        :key="'dot-' + i"
        :class="{ on: i === current }"
        :aria-label="`切换到第 ${i + 1} 张`"
        @click="goSlide(i)"
      ></li>
    </ul>
  </div>

  <!-- 展示区 -->
  <main id="webmain">
    <article class="webz con">
      <!-- tv直播 -->
      <article class="webz_title">
        <span class="fl">
          <i class="fl webz_title_line"></i>
          <span class="webz_title_tt"><i>TV</i>直播</span>
          网站下单立减10元
        </span>
        <a href="javascript:void(0)" class="toTv fr"></a>
      </article>
      <article class="webz_live">
        <article class="webz_live_list">
          <ul>
            <li>
              <div class="live_cc" v-for="s in tvShows" :key="s.sid" @click="goDetail(s.sid)">
                <div class="live_cc_img" :style="{ backgroundImage: `url(${s.img})` }">
                  <i class="live_ing">TV直播中</i>
                  <img class="live_logo" src="/museum/css-img/u_shopping.png" height="60" width="200" alt="" />
                  <div class="live_back">
                    <span>{{ tvTimeText }}</span>
                  </div>
                </div>
                <a href="javascript:void(0)">
                  <p class="live_tit">
                    <em class="img_tit">
                      {{ s.name }}
                    </em>
                  </p>
                  <div class="live_qian">
                    <span class="live_qian_v">￥{{ s.price }}</span>
                  </div>
                </a>
              </div>
            </li>
          </ul>
        </article>
      </article>

      <!-- 今日限时折扣 -->
      <!-- 头部 -->
      <article class="webz_title">
        <span class="fl">
          <i class="fl webz_title_line"></i>
          <span class="webz_title_tt"><i>今日</i>限时购</span>
        </span>
        <div class="day_djs fr">本场还剩
          <div class="fr livetime-day">
            <span class="d_hour">{{ dHour }}</span> : <span class="d_minute">{{ dMinute }}</span> : <span class="d_second">{{ dSecond }}</span>
          </div>
        </div>
      </article>
      <!-- 主体 -->
      <article class="zhuti">
        <div class="everyDay fl">
          <div>
            <div class="everyDayimg">
              <img src="/museum/img/goods_midea.jpg"/>
            </div>
            <p class="everyDay_tjs"> 轻松熨烫 衣物除皱</p>
            <p class="everyDay_tt">美的立式蒸汽挂烫机 多档位面料调节 可升降衣架 香芋紫</p>
            <p class="everyDay_price">
              <span>￥399</span>
              <em>￥499</em>
            </p>
            <div class="everyDay_tag">
              <span>立减<br />100元</span>
            </div>
            <div class="everyDay_tag2">
              <i></i><span>每日一品</span>
            </div>
          </div>
        </div>
        <div class="everyLun fr">
          <div class="d_prev" @click="toggleLun"></div>
          <div class="d_next" @click="toggleLun"></div>
          <ul :style="{ left: lunLeft + 'px' }">
            <li v-for="(c, i) in cardLoop" :key="i" :aria-hidden="i >= 4 ? 'true' : undefined">
              <div>
                <div class="lunImg">
                  <img src="/museum/img/goods1.jpg" alt="" />
                </div>
                <p class="everyDay_tt">奥地利进口 Zotter 100%秘鲁可可 黑巧克力排块 纯素无乳糖零蔗糖</p>
                <p class="everyDay_price">
                  <span>￥79</span>
                  <em>￥109</em>
                </p>
              </div>
            </li>
          </ul>
        </div>
      </article>

      <!-- 品类促销（N4：原站仅标题空模块，补 6 个品类入口卡，点击跳列表分类过滤） -->
      <article class="webz_title">
        <span class="fl">
          <i class="fl webz_title_line"></i>
          <span class="webz_title_tt"><i>品类精选</i>促销</span>
        </span>
      </article>
      <article class="category_promo">
        <a
          v-for="c in promoCats"
          :key="c.title"
          href="javascript:void(0)"
          class="category_promo_item"
          @click="goCategoryList(c.title)"
        >
          <img :src="c.icon" height="60" width="80" alt="" />
          <span class="cp_name">{{ c.title }}</span>
          <span class="cp_enter">进入专区<i>&gt;</i></span>
        </a>
      </article>

      <!-- 全球尖货 -->
      <!-- 头部 -->
      <article class="webz_title">
        <span class="fl">
          <i class="fl webz_title_line"></i>
          <span class="webz_title_tt"><i></i>全球尖货</span>
        </span>
      </article>
      <!-- 主体（N2 客观重构：原站 ul 1020 固定宽一行仅容三卡、float 无清浮动致
           ul/容器实测高度 0，卡内 span>p 非法嵌套 + absolute 悬浮直降标签 +
           visibility:hidden 空占位。改 flex 网格 2 行 8 卡（每行 4 卡等分版心）
           + 语义化价格两行，视觉基因保留，差异详见文末样式） -->
      <article class="item_list_box">
        <ul>
          <li v-for="g in globalGoods" :key="g.sid" @click="goDetail(g.sid)">
            <div class="item_box">
              <div class="item_img" :style="{ backgroundImage: `url(${g.img})` }"></div>
              <p class="img_title">{{ g.name }}</p>
              <p class="img_abstract">{{ g.abstract }}</p>
              <div class="img_qian">
                <div class="qian_main">
                  <span class="img_qian_price"><i>￥</i>{{ g.price }}</span>
                  <span v-if="g.tag" class="sale_tag">{{ g.tag }}</span>
                </div>
                <div class="qian_sub">
                  <span class="regular_price">平日价<i>￥</i><em>{{ g.regular }}</em></span>
                  <span class="img_qian_purchased"><i>{{ g.purchased }}</i>已购买</span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </article>
    </article>
  </main>
</template>

<style>
/* rebuild 轮播增补：原站 myfocus 的 li 定位与切换由其内联样式实现，此处等效还原 */
.scroll_tu {
  position: relative;
}
.scroll_tu .ugoshop-carousel {
  height: 100%;
  margin: 0;
  padding: 0;
}
.scroll_tu .ugoshop-carousel li {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.scroll_tu .ugoshop-carousel li.on {
  opacity: 1;
}
/* 移植 CSS 的 .scroll_tu li img { margin-left:-352px } 在原站是从未命中的死规则
   （原站 img 实为 .pic 直接子元素、顶格显示），rebuild 的 li 结构使其首次生效
   曾致图片左移 352px、右侧露出 .scroll_tu 的粉色底。此处覆盖回 0，
   恢复原站实际渲染：图片顶格、右缘随视口宽度自然裁切。 */
.scroll_tu .ugoshop-carousel li img {
  margin-left: 0;
}
/* I5：指示圆点（半透明白点，当前帧站内主色 #00bfcf） */
.ugoshop-carousel-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ugoshop-carousel-dots li {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background 0.2s ease;
}
.ugoshop-carousel-dots li.on {
  background: #00bfcf;
}
@media (prefers-reduced-motion: reduce) {
  .ugoshop-carousel-dots li {
    transition: none;
  }
}

/* ———— 今日限时购左卡（每日一品）排版修正（新站优化，2026-10）————
   原站白卡内容区高 307px，内容实需 339px（图 200 + 宣传语 34 + 两行标题 48 +
   价格 57）：价格溢出白卡 17px 压在渐变红底上、被「立减」标签遮挡右半；
   「每日一品」徽章（top:17）压住商品图顶部 logo。
   修正后内容总高 ≈ 290px，价格完整收回白卡并远离标签；
   徽章上移骑白卡上边线（top:2），下缘与商品图顶部相切不重叠。
   选择器加 #webmain 前缀抬高特异性，不依赖注入顺序。 */
#webmain .webz .zhuti .everyDay > div .everyDayimg {
  height: 170px;
}
#webmain .webz .zhuti .everyDay > div .everyDay_tjs {
  padding-top: 6px;
}
#webmain .webz .zhuti .everyDay > div .everyDay_price {
  padding-top: 8px;
}
#webmain .webz .zhuti .everyDay > div .everyDay_price em {
  line-height: 28px;
}
#webmain .webz .zhuti .everyDay > div .everyDay_tag2 {
  top: 2px;
}

/* ———— N1：TV 直播卡新站化增补 ————
   原背景图 dooo.jpg 为 750×400（1.875 比例恰满铺 300×160 容器）；N1 换上
   450×450 正方商品图后 background-size:100% 会纵向压扁变形，改 cover+center
   居中裁切保商品主体；卡片接跳详情补手型光标。 */
#webmain .webz .webz_live .webz_live_list ul li .live_cc {
  cursor: pointer;
}
#webmain .webz .webz_live .webz_live_list ul li .live_cc .live_cc_img {
  background-size: cover;
  background-position: center;
}

/* ———— N2：全球尖货卡接跳详情补手型光标（hover 红边为原站样式） ———— */
#webmain .webz .item_list_box ul li {
  cursor: pointer;
}

/* ———— N2 客观重构（2026-10 复查二修）：全球尖货模块布局修复 ————
   原站移植 CSS 的客观缺陷（非风格差异）：
   ① ul 固定 width:1020px 溢出 1000px 版心，每卡实占 340px（含 20 右 margin），
     一行仅容 3 张，第 4 张孤悬第二行（3+1 断裂）；
   ② li 全 float 且无清浮动，ul 与 item_list_box 高度塌陷为 0
     （仅靠 .webz overflow:hidden BFC 兑底，footer 未叠压非自适应能力）；
   ③ li 固定 height:452 + overflow:hidden，内容增高即被静默裁切；
   ④ span.sale_price 内嵌 p（HTML 非法嵌套），「直降」靠 absolute top:-16px
     悬浮 hack，非直降卡整块 visibility:hidden 空元素占位。
   重构（用户需求：2 行 8 卡）：grid 网格每行 4 卡等分版心（repeat(4, 1fr)
   ——分配型等分无亚像素换行问题；曾试 flex-wrap + calc(25%) 等分，四卡加
   gap 恰等 1000px，亚像素累积溢出即触发拆行），列间 12px / 行间 20px，
   标题到首行 20px 由容器 margin-top 提供，8 卡等高拉伸，item_img 宽自适应
   卡宽（aspect-ratio 保持正方不变形），价格区改语义两行；hover 红边、
   26px 现价、红胶囊、划线平日价、灰已购买等视觉基因全部保留。 */
#webmain .webz .item_list_box ul {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 12px; /* 行间 20 / 列间 12 */
  width: auto; /* 覆盖原 1020px 固定宽，回归版心 1000px */
  margin-top: 20px; /* 原由 li margin-top 提供，统一收敛到容器 */
}
#webmain .webz .item_list_box ul li {
  float: none;
  display: flex; /* cell 内撑满，行内等高由 grid stretch 保证 */
  width: auto;
  height: auto; /* 解除 452 固定高 */
  margin: 0; /* 间距全部交由容器 gap 接管 */
}
#webmain .webz .item_list_box ul li .item_box {
  flex: 1;
  display: flex;
  flex-direction: column;
}
#webmain .webz .item_list_box ul li .item_box .item_img {
  width: auto; /* 原 298 固定宽 → 自适应卡宽 */
  height: auto;
  aspect-ratio: 1 / 1; /* 商品图为正方，保持不变形 */
}
#webmain .webz .item_list_box ul li .item_box .img_qian {
  margin-top: 10px;
}
#webmain .webz .item_list_box ul li .item_box .img_qian .qian_main {
  display: flex;
  align-items: center;
  gap: 8px;
}
#webmain .webz .item_list_box ul li .item_box .img_qian .qian_main .img_qian_price {
  margin-right: 0; /* 间距由 gap 接管 */
}
#webmain .webz .item_list_box ul li .item_box .img_qian .sale_tag {
  display: inline-block;
  height: 18px;
  line-height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  background: #ff504a;
  color: #fff;
  font-size: 12px;
}
#webmain .webz .item_list_box ul li .item_box .img_qian .qian_sub {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 6px;
  font-size: 12px;
}
#webmain .webz .item_list_box ul li .item_box .img_qian .qian_sub .regular_price {
  color: #999;
}
#webmain .webz .item_list_box ul li .item_box .img_qian .qian_sub .regular_price i {
  margin-right: 1px;
}
#webmain .webz .item_list_box ul li .item_box .img_qian .qian_sub .regular_price em {
  text-decoration: line-through; /* 仅划线数字，「平日价」文案不划 */
}
#webmain .webz .item_list_box ul li .item_box .img_qian .qian_sub .img_qian_purchased {
  margin-top: 0; /* 覆盖原 float 版 margin-top:9 */
  color: #666;
}
#webmain .webz .item_list_box ul li .item_box .img_qian .qian_sub .img_qian_purchased i {
  color: #f70800;
}

/* ———— N4：品类促销楼层（原站空模块补齐，2026-10）————
   6 个品类入口卡横排：白底 1px 灰边（同全球尖货卡），hover 红边（同
   item_list_box li:hover 风格），icon 复用列表页分类 tab 素材 80×60。 */
.webz .category_promo {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.webz .category_promo .category_promo_item {
  flex: 1;
  padding: 20px 0 16px;
  background: #fff;
  border: 1px solid #ddd;
  text-align: center;
  text-decoration: none;
  transition: border-color 0.2s ease;
}
.webz .category_promo .category_promo_item img {
  display: block;
  margin: 0 auto;
}
.webz .category_promo .category_promo_item:hover {
  border-color: #ff504a;
}
.webz .category_promo .category_promo_item .cp_name {
  display: block;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #222;
}
.webz .category_promo .category_promo_item .cp_enter {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}
.webz .category_promo .category_promo_item:hover .cp_enter {
  color: #ff504a;
}
</style>
