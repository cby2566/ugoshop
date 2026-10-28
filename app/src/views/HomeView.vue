<!--
  首页主体（原站 homepage.html .scroll_tu + #webmain 原样移植）。
  与原站的三处有意差异（其余像素级照搬）：
  - 主轮播：原站 myfocus 焦点图自始被注释、呈现为静态单图，此处按设计意图
    以 luntu1-5 五图自动淡入轮播等效还原（素材实为 1920×340，原站顶格显示）
  - 今日限时购右侧小卡 d_prev/d_next：原站 fnuxn 仅定义未接线，此处接上
    （left 在 0 与 -473px 间切换，与原实现数值一致）
  - 全球尖货 .item_img 背景为失效外链，已在移植 CSS 内本地等效替换
  楼层商品文案（双立人/SKG 养生壶/一品玉红枣等）为原站硬编码展示位，原样保留。
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

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

// —— 今日限时购小卡轮播（原站 fnuxn：left 在 0 与 -473px 之间切换）——
const lunLeft = ref(0)
function toggleLun() {
  lunLeft.value = lunLeft.value === 0 ? -473 : 0
}
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
        <a href="" class="toTv fr"></a>
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
                <a href="">
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
            <span class="d_hour">18</span> : <span class="d_minute">23</span> : <span class="d_second">01</span>
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
            <li v-for="n in 4" :key="n">
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
</style>
