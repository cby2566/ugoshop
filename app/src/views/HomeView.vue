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
  楼层商品文案（双立人/SKG 养生壶/一品玉红枣等）为原站硬编码展示位，原样保留。
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// —— 主轮播（luntu1-5，对应原站五张焦点图素材）——
const banners = [1, 2, 3, 4, 5].map((n) => `/museum/img/luntu${n}.jpg`)
const current = ref(0)
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => {
    current.value = (current.value + 1) % banners.length
  }, 3500)
})
onBeforeUnmount(() => window.clearInterval(timer))

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
</script>

<template>
  <!-- 轮播图 -->
  <div class="scroll_tu" id="scroll_tu">
    <ul class="ugoshop-carousel">
      <li v-for="(b, i) in banners" :key="b" :class="{ on: i === current }">
        <img :src="b" alt="" />
      </li>
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
              <div class="live_cc" v-for="n in 3" :key="n">
                <div class="live_cc_img">
                  <i class="live_ing">TV直播中</i>
                  <img class="live_logo" src="/museum/css-img/u_shopping.png" height="60" width="200" alt="" />
                  <div class="live_back">
                    <span>20:20:20</span>
                  </div>
                </div>
                <a href="javascript:void(0)">
                  <p class="live_tit">
                    <em class="img_tit">
                      双立人287周年狂欢限量套装
                    </em>
                  </p>
                  <div class="live_qian">
                    <span class="live_qian_v">￥2998</span>
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
            <p class="everyDay_tjs"> 滋补养生 一壶多用</p>
            <p class="everyDay_tt">SKG 多功能养生壶 加厚硼硅玻璃1.8L保温电水壶 8056C 咖啡色  共同</p>
            <p class="everyDay_price">
              <span>￥149</span>
              <em>￥199</em>
            </p>
            <div class="everyDay_tag">
              <span>立减<br />50元</span>
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
                <p class="everyDay_tt">澳洲进口喜运亨羽绒服毛呢干洗剂清洗剂衣物免水洗家用大衣布艺去油清洁剂50ml*2</p>
                <p class="everyDay_price">
                  <span>￥149</span>
                  <em>￥199</em>
                </p>
              </div>
            </li>
          </ul>
        </div>
      </article>

      <!-- 品类促销 -->
      <article class="webz_title">
        <span class="fl">
          <i class="fl webz_title_line"></i>
          <span class="webz_title_tt"><i>品类精选</i>促销</span>
        </span>
      </article>

      <!-- 全球尖货 -->
      <!-- 头部 -->
      <article class="webz_title">
        <span class="fl">
          <i class="fl webz_title_line"></i>
          <span class="webz_title_tt"><i></i>全球尖货</span>
        </span>
      </article>
      <!-- 主体 -->
      <article class="item_list_box">
        <ul>
          <li v-for="n in 4" :key="n">
            <div class="item_box">
              <div class="item_img"></div>
              <p class="img_title">一品玉富硒红枣夹核桃</p>
              <p class="img_abstract">
                含有微量元素硒
                组合力度 性价比高
                独立包装 携带便捷
                包装精美 重量升级
                老少皆宜 营养丰富</p>
              <div class="img_qian">
                <span class="fl img_qian_price"><i>￥</i>298</span>
                <span class="sale_price" v-if="n === 2">
                  <p>
                    <em>
                      直降
                    </em>
                  </p>
                  <span>平日价</span><em><i>￥</i>118</em>
                </span>
                <span class="sale_price" style="visibility:hidden;" v-else>
                  <p>
                    <em>

                    </em>
                  </p>
                  <span>平日价</span><em><i>￥</i>118</em>
                </span>
                <span class="fr img_qian_purchased"><i>1970</i>已购买</span>
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
</style>
