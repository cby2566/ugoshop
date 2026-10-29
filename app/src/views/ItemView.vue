<!--
  商品详情页主体（原站 itemDetailed.html <main> 区原样移植，视觉像素级照搬）。
  与原站的有意差异（逻辑按重写定案做真功能）：
  - 数据：原站 xunID() 经 ulist2.php?flag=i 按 URL ?id 取数并覆盖品牌/名称/描述/价格
    四字段，此处等效改为 GET /api/products/:sid；商品不存在时提示并返回列表
    （原站呈现空白页）；
  - 加购：A 方案（登录才能加购）。原站未登录仅 alert 且不拦截、请求照发（bug），
    此处拦截提示；飞入动画（jquery-addShopping 两段 jQuery animate + 末尾
    location.reload()）按行为等价以 WAAPI 重写，reload 已按定案丢弃；加购接口
    已接 POST /api/cart（阶段 6），badge 随 cart store 响应式更新；
  - 数量：原站手输非数字会产生 NaN 不修正，此处统一修正为 ≥1 整数；
  - 静态展示位（面包屑/优惠文案/送至栏/详情长图/评论(50)/服务说明/大家都在看）
    为原站硬编码，原样保留。
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from '@/utils/toast'

import '@/styles/itemdetailed.css'
import '@/styles/magnifier.css'
import GoodsGallery from '@/components/GoodsGallery.vue'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const product = ref<Product | null>(null)
const error = ref<string | null>(null)
const sid = computed(() => Number(route.params.sid))

// 原站渲染规则：${URL}_1/_2/_3.jpg 三图系列，素材已迁至 /museum/img/
const galleryImgs = computed(() => {
  if (!product.value) return []
  const base = (product.value.legacyUrl ?? '').split('/').pop() ?? ''
  return [1, 2, 3].map((n) => `/museum/img/${base}_${n}.jpg`)
})

async function fetchProduct() {
  error.value = null
  try {
    product.value = await api.product(sid.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    toast('商品不存在或已下架')
    void router.replace('/list')
  }
}

// 同路由不同商品直接换数据（原站为多页跳转整页加载）
watch(sid, fetchProduct)

// I9：详情页标题跟随商品名（路由 afterEach 兜底其他页）
watch(
  product,
  (p) => {
    if (p) document.title = `${p.name} - 优品惠`
  },
  { immediate: true },
)

// D3：面包屑——首页回 /、美食回 /list、分类接 /list?category=（依赖 D1 分类字段）
function goCategory(category: string) {
  void router.push({ path: '/list', query: { category } })
}

// —— 数量选择器（原站：减到 1 为止、加无上限） ——
const qty = ref(1)
function minus() {
  if (qty.value > 1) qty.value -= 1
}
function plus() {
  qty.value += 1
}
function fixQty() {
  const n = Number.parseInt(String(qty.value), 10)
  qty.value = Number.isFinite(n) && n >= 1 ? n : 1
}

// —— 加入购物车（A 方案：登录才能加购；阶段 5 接入真实会话判断） ——
function isLoggedIn(): boolean {
  return auth.me != null
}

function onAddCart(e: MouseEvent) {
  if (!isLoggedIn()) {
    toast('请先登录后购买')
    return
  }
  // 注意：await 之后 e.currentTarget 会被浏览器置空，需同步捕获按钮元素
  const btn = e.currentTarget as HTMLElement
  void addAndFly(btn)
}

// 原版 feirufei：加购请求 + 飞入动画（原版动画结束 location.reload 刷新 badge，
// 重写由 cart store 响应式更新顶栏/侧栏 badge）
async function addAndFly(btn: HTMLElement) {
  try {
    await cart.add(sid.value, qty.value)
  } catch (err) {
    toast(err instanceof Error ? err.message : '加入购物车失败')
    return
  }
  void flyToCart(btn)
}

// 飞入购物车（原站 lib/jquery-addShopping.js 按行为等价重写）：
// 白底红边小图自按钮飞向侧栏 .cbl（两段各 500ms），原版动画结束后
// location.reload() 整页刷新已按定案丢弃（badge 由 cart store 响应式更新）
async function flyToCart(btn: HTMLElement) {
  const end = document.querySelector('.cbl')
  if (!btn || !(end instanceof HTMLElement)) return
  const s = btn.getBoundingClientRect()
  const E = end.getBoundingClientRect()
  const sx = window.scrollX
  const sy = window.scrollY
  const x = s.left + sx + 30
  const y = s.top + sy + 10
  const endX = E.left + sx - 30
  const endY = E.top + sy

  const icon = document.createElement('div')
  icon.id = 'cartIcon'
  icon.style.cssText =
    'width:50px;height:50px;padding:2px;background:#fff;border:solid 5px #e54144;overflow:hidden;position:absolute;z-index:890;'
  const img = new Image()
  img.width = 50
  img.height = 50
  img.src = '/museum/img/bei.png'
  icon.appendChild(img)
  icon.style.left = x + 'px'
  icon.style.top = y + 'px'
  document.body.appendChild(icon)

  await icon.animate(
    [
      { left: x + 'px', top: y + 'px', opacity: 1 },
      { left: endX + 'px', top: endY + 70 + 'px', opacity: 1 },
    ],
    { duration: 500, easing: 'ease', fill: 'forwards' },
  ).finished
  await icon.animate(
    [
      { top: endY + 70 + 'px', opacity: 1 },
      { top: endY - 10 + 'px', opacity: 0 },
    ],
    { duration: 500, easing: 'ease', fill: 'forwards' },
  ).finished
  icon.remove()
}

// —— 详情区锚点 tab（原站：点击高亮 + 滚过顶部后吸顶） ——
const tab = ref<'detail' | 'comment' | 'service'>('detail')
const tabEl = ref<HTMLElement | null>(null)
const tagFixed = ref(false)

// I8：锚点改为 scrollIntoView，避免改写 URL hash
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function onScroll() {
  const el = tabEl.value
  if (el) tagFixed.value = el.getBoundingClientRect().top <= 0
}

onMounted(async () => {
  await fetchProduct()
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <main class="con">
    <!-- 面包屑（D3：首页/分类接真路由，末级为当前商品品牌） -->
    <div class="loc">
      <ul>
        <li>当前位置：</li>
        <li><a href="javascript:void(0)" @click="router.push('/')">首页</a><i>></i></li>
        <li><a href="javascript:void(0)" @click="router.push('/list')">美食</a><i>></i></li>
        <li v-if="product?.category"><a href="javascript:void(0)" @click="goCategory(product.category!)">{{ product.category }}</a><i>></i></li>
        <li>{{ product?.brand || '商品详情' }}</li>
      </ul>
    </div>

    <!-- 左列：放大镜 -->
    <div class="goods_key">
      <GoodsGallery :imgs="galleryImgs" />
    </div>

    <!-- 右列：商品信息 -->
    <div class="goods_look">
      <a class="goods_tagName">{{ product?.brand }}</a>
      <span class="goods_Name">{{ product?.name }}</span>
      <span
        class="goods_xiang"
        style="display: block; color: #888; font-size: 12px; margin-top: 6px; line-height: 1.5; max-width: 360px"
      >{{ product?.description }}</span>
      <div class="priceBox">
        <div class="fl">
          <span>价格</span>
          <span>优惠</span>
        </div>
        <div class="fl">
          <h2 class="goods_price">￥{{ product?.price }}</h2>
          <span class="discount"><i>立减</i> TV商品下单立减10元</span>
          <span class="discount"><i>包邮</i> 订单金额满168元包邮</span>
        </div>
      </div>
      <div class="addressBox">
        <div class="fl">
          <span>送至</span>
          <span>数量</span>
        </div>
        <div class="fl">
          <div class="emqs"></div><a href="javascript:void(0)"></a><br />
          <div class="box">
            <a href="javascript:void(0)" id="lessBtn" @click="minus">-</a>
            <input id="goodsNumberInput" type="text" v-model="qty" @blur="fixQty" />
            <a href="javascript:void(0)" id="addBtn" @click="plus">+</a>
          </div>
        </div>
      </div>
      <div class="addCart" @click="onAddCart"><i></i>加入购物车</div>

      <div class="other">TV商品 此商品由 <span>优购物官方直营店</span> 发货，提供售后服务</div>
    </div>

    <div class="fenlie"></div>

    <!-- 详情长图区（原站静态硬编码） -->
    <div class="item_xia lf">
      <div ref="tabEl" class="xia_tag" :class="{ xia_tag_xi: tagFixed }">
        <a href="javascript:void(0)" class="xia_xiang" :class="{ asd: tab === 'detail' }" @click="tab = 'detail'; scrollTo('k1')">商品详情</a>
        <a href="javascript:void(0)" class="xia_ping" :class="{ asd: tab === 'comment' }" @click="tab = 'comment'; scrollTo('k2')">评论<span>(50)</span></a>
        <a href="javascript:void(0)" class="xia_tu" :class="{ asd: tab === 'service' }" @click="tab = 'service'; scrollTo('k3')">服务说明</a>
      </div>
      <h3 id="k1" class="fw_title sp_fw_title"></h3>
      <div><img src="/museum/img/dog.PNG" alt="" /></div>
      <div><img src="/museum/img/优购80_01.jpg" alt="" /></div>
      <div><img src="/museum/img/优购80_02.jpg" alt="" /></div>
      <div><img src="/museum/img/优购80_03.jpg" alt="" /></div>
      <div><img src="/museum/img/优购80_05.jpg" alt="" /></div>
      <div><img src="/museum/img/优购80_01.jpg" alt="" /></div>
      <h3 id="k2" class="fw_title" style="background: url(/museum/img/title_bg.png) 0 -27px no-repeat"></h3>
      <div><img src="/museum/img/dog2.PNG" alt="" /></div>
      <h3 id="k3" class="fw_title"></h3>
      <div><img src="/museum/img/return_goods_des.png" alt="" /></div>
      <div><img src="/museum/img/price_explain.jpg" alt="" /></div>
    </div>

    <!-- 大家都在看（原站静态硬编码） -->
    <div class="item_xiayou">
      <h3>大家都在看</h3>
      <div class="cainixihuan"></div>
      <div class="cainixihuan"></div>
    </div>
  </main>
  <div class="ceshiyon"></div>
</template>
