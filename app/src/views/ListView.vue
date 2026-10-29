<!--
  列表页主体（原站 foodList.html .classify 起原样移植，视觉像素级照搬）。
  与原站的有意差异（逻辑按重写定案做真功能，交互对齐 museum 实测）：
  - 原站 footList.js 的数据加载/分页（ahj/ahj2）为注释掉的死代码，museum 纪念版
    由 mock-api.js 代为激活；此处按同一设计意图接真数据（GET /api/products 分页）
    与真分页（#P_fan），页码修正为正序（原版 3-i 生成倒序页码 0-3，属 bug）；
  - 价格排序两态 toggle（升↔降，与 museum 实测一致），
    箭头复用原站 .jg_pai/.jg_pai2 雪碧图位；
  - 其余查找项（销量/上架时间等）与自营/商家 checkbox：原站无对应数据维度
    与任何逻辑，视觉保留、点击等效无操作（仅高亮）；
  - 评论数 40 / 评价"好好好" / 积分 0 为原站模板硬编码展示位，原样保留；
  - 当前页码高亮为真分页新增视觉（站内主色 #00bfcf）。
  - 卡片点击跳详情已按原站行为接上（原站 location.href itemDetailed.html?id=sid → /item/:sid）。
-->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/utils/toast'

import '@/styles/foodlist_main.css'
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/types'

const store = useProductsStore()
const router = useRouter()

// 原站行为：卡片点击跳 itemDetailed.html?id=sid；此处接 /item/:sid（阶段 4 接线）
function goDetail(sid: number) {
  void router.push(`/item/${sid}`)
}

// 分类 icon 导航（原站硬编码展示位，原样保留；icon 素材已迁至 /museum/img/）
const classifications = [
  { icon: '/museum/img/menuimg_03.png', title: '全部商品' },
  { icon: '/museum/img/icon_a_93.png', title: '进口食品' },
  { icon: '/museum/img/icon_a_829.png', title: '营养保健' },
  { icon: '/museum/img/icon_a_364.png', title: '休闲食品' },
  { icon: '/museum/img/icon_a_959.png', title: '粮油干货' },
  { icon: '/museum/img/icon_a_822.png', title: '酒水茶饮' },
  { icon: '/museum/img/icon_a_1245.png', title: '生鲜食品' },
]

onMounted(async () => {
  await store.fetchList()
  if (store.error) toast(store.error, 'error')
})

// 原站渲染规则：${URL}_1.jpg（URL 形如 ../img/goods2），素材在 /museum/img/
function productImage(p: Product): string {
  if (p.image) return p.image
  const name = (p.legacyUrl ?? '').split('/').pop() ?? ''
  return `/museum/img/${name}_1.jpg`
}

async function withFeedback(action: () => Promise<void>) {
  await action()
  if (store.error) toast(store.error, 'error')
}
</script>

<template>
  <div class="classify">
    <div id="div1" class="con clearfix">
      <div class="nav_zz" v-for="c in classifications" :key="c.title">
        <img :src="c.icon" height="60" width="80" alt="" />
        <span>{{ c.title }}</span>
      </div>
    </div>
    <div class="foot_list_title con">
      <img src="/museum/img/icon_list1.png" height="24" width="24" alt="" />
      <h1>进口食品</h1>
    </div>
    <div class="foot_list_nav con">
      <div class="list_nav_l fl">
        <ul>
          <li style="pointer-events: none;">快速查找：</li>
          <li @click="withFeedback(store.resetOrder)"><span>今日推荐</span></li>
          <li style="pointer-events: none;"><b>|</b></li>
          <li @click="withFeedback(store.resetOrder)"><span>销量</span></li>
          <li @click="withFeedback(store.resetOrder)"><span>上架时间</span></li>
          <li :class="{ paipai: store.priceActive }" @click="withFeedback(store.togglePrice)">
            <span id="jg_pai" :class="store.priceDesc ? 'jg_pai2' : 'jg_pai'">价格</span>
          </li>
          <li style="pointer-events: none;"><b>|</b></li>
          <li @click="withFeedback(store.resetOrder)"><span>特惠</span></li>
        </ul>
      </div>
      <div class="list_nav_r fr">
        <input type="checkbox" /><span>优品自营</span>
        <input type="checkbox" /><span>入驻商家</span>
      </div>
    </div>
  </div>

  <div id="flist_t">
    <div class="flist_t con">
      <div class="goods" v-for="p in store.items" :key="p.id" @click="goDetail(p.sid)">
        <img class="goods_img" :src="productImage(p)" />
        <span class="goods_name">{{ p.name }}</span>
        <div class="qian_comment">
          <span class="goods_qian fl">￥{{ p.price }}</span>
          <span class="goods_comment fr">评论<a href="javascript:void(0)">40</a>条</span>
        </div>
        <div class="ping">
          <div class="fl"><span>免邮费</span></div>
          <div class="fr"><span>积分</span>0</div>
          <div>
            <p>用户评价</p>
            <span><img src="/museum/css-img/leftyin.jpg" height="9" width="13" alt="" /></span>
            <span class="zhongPing">好好好</span>
            <span><img src="/museum/css-img/rightyin.jpg" height="10" width="14" alt="" /></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="P_fan">
    <a @click="withFeedback(store.prevPage)">上一页</a>
    <span
      v-for="n in store.totalPages"
      :key="n"
      :class="{ cur: n === store.page }"
      @click="withFeedback(() => store.goto(n))"
    >{{ n }}</span>
    <a @click="withFeedback(store.nextPage)">下一页</a>
  </div>
  <div class="goods_b"></div>
</template>

<style>
/* I1：列表页商品卡可点击光标（rebuild 增补） */
.flist_t .goods {
  cursor: pointer;
}
</style>
