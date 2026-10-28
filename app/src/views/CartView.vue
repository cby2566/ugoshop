<!--
  购物车页主体（原站 CarCar.html .con.carcar 区原样移植，视觉像素级照搬）。
  与原站的有意差异（逻辑按重写定案做真功能）：
  - 数据：原版 Cookie 拿用户名走 car.php?flag=g（JOIN）；重写走 GET /api/cart
    （签名会话 + 服务端 JOIN），未登录访问提示并转登录页（原版按 fid=0 查空显示）；
  - 数量：原版 +/- 各发一次 flag=jia 覆盖数量、到 1 不再减；重写 PATCH 更新，
    手输非数字修正为 ≥1；
  - 全选：原版底部「全选」只勾不取消、头部全选框无逻辑；重写两处联动真 toggle；
  - 金额：原版 hei() 实付硬编码 ns-10（TV 立减残留 bug，PROJECT_SUMMARY 9.2），
    重写按定案丢弃，优惠金额显示 0、实付=勾选商品小计之和；「共 X 件商品」沿原版
    按勾选行数计；
  - 删除：原版 del.php 后 location.reload() 整页刷新，重写 DELETE 响应式更新；
  - 「立即结算」为原站死链接（href=""），视觉保留、无操作。
-->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/api/client'

const router = useRouter()
const auth = useAuthStore()
const store = useCartStore()

// 勾选状态（原版为 DOM 勾选，不落后端；重写用本地集合）
const selected = ref<Set<number>>(new Set())

function syncSelected() {
  // 默认全选（原版商品行 checkbox 初始 checked）
  selected.value = new Set(store.items.map((i) => i.sid))
}

const allChecked = computed({
  get: () => store.items.length > 0 && selected.value.size === store.items.length,
  set: (v: boolean) => {
    selected.value = v ? new Set(store.items.map((i) => i.sid)) : new Set()
  },
})

function toggle(sid: number) {
  const next = new Set(selected.value)
  if (next.has(sid)) next.delete(sid)
  else next.add(sid)
  selected.value = next
}

// 勾选行的商品金额小计之和（原版 hei() 的 ns，去 ns-10 后即实付）
const goodsTotal = computed(() =>
  store.items.filter((i) => selected.value.has(i.sid)).reduce((s, i) => s + i.price * i.quantity, 0),
)
const checkedCount = computed(() => store.items.filter((i) => selected.value.has(i.sid)).length)
const payable = computed(() => goodsTotal.value)

function productImage(item: CartItem): string {
  if (item.image) return item.image
  const name = (item.legacyUrl ?? '').split('/').pop() ?? ''
  return `/museum/img/${name}_1.jpg`
}

// —— 数量（原版到 1 不再减、加无上限） ——
async function minus(item: CartItem) {
  if (item.quantity <= 1) return
  await changeQty(item, item.quantity - 1)
}

async function plus(item: CartItem) {
  await changeQty(item, item.quantity + 1)
}

async function changeQty(item: CartItem, quantity: number) {
  try {
    await store.updateQuantity(item.sid, quantity)
  } catch (e) {
    ElMessage(e instanceof Error ? e.message : '更新失败')
  }
}

function onQtyBlur(item: CartItem, e: Event) {
  const input = e.target as HTMLInputElement
  const n = Number.parseInt(input.value, 10)
  const qty = Number.isFinite(n) && n >= 1 ? n : item.quantity
  input.value = String(qty)
  if (qty !== item.quantity) void changeQty(item, qty)
}

// —— 删除（原版 del.php + reload，重写响应式） ——
async function del(item: CartItem) {
  try {
    await store.remove(item.sid)
  } catch (e) {
    ElMessage(e instanceof Error ? e.message : '删除失败')
  }
}

// 列表变化后剔除已消失商品的勾选（本页内不会新增；他处加购后回到本页为新 mount 全选）
watch(
  () => store.items.map((i) => i.sid).join(','),
  () => {
    const alive = new Set(store.items.map((i) => i.sid))
    selected.value = new Set([...selected.value].filter((sid) => alive.has(sid)))
  },
)

onMounted(async () => {
  // 直接访问 /cart 时登录态会话校验可能尚未完成（App 壳层异步初始化），先确保就绪
  if (!auth.loaded) await auth.fetchMe()
  if (!auth.me) {
    ElMessage('请先登录')
    void router.replace('/login')
    return
  }
  await store.fetchCart()
  syncSelected()
})
</script>

<template>
  <div class="con carcar">
    <div class="car_til">
      <img src="/museum/img/carcar.PNG" alt="" />
    </div>
    <div class="car_con">
      <p>我的购物车</p>
      <ul class="cart_con_tit clearfix">
        <li class="tit_check">
          <input type="checkbox" data-role="all" v-model="allChecked" />
          <label>全选</label>
        </li>
        <li class="tit_meg">商品信息</li>
        <li class="tit_price">单价（元）</li>
        <li class="tit_quantity">数量</li>
        <li class="tit_sum">小计（元）</li>
        <li class="tit_action">操作</li>
      </ul>
      <div class="cart_split">
        <template v-if="store.items.length">
          <!-- 是否自营 -->
          <div class="cart_split_tt">
            <input type="checkbox" data-role="block" checked />
            <i class="icon_home"></i>
            <label>优品惠自营</label>
            <span>满168包邮</span>
          </div>
          <!-- 每个商品 -->
          <div class="shopping_con clearfix" v-for="item in store.items" :key="item.sid">
            <div class="c_meg">
              <dl>
                <dt>
                  <a href="javascript:;"><img :src="productImage(item)" width="78" height="78" /></a>
                </dt>
                <dd>
                  <p class="m_tit"><a href="javascript:;">{{ item.name }}</a></p>
                </dd>
              </dl>
            </div>
            <div class="c_price">
              <p class="c_price_num">¥<i>{{ item.price }}</i></p>
            </div>
            <div class="c_quantity">
              <div class="c_amount clearfix">
                <a href="javascript:void(0)" :class="{ disabled: item.quantity <= 1 }" @click="minus(item)">-</a>
                <input type="text" name="amt" :value="item.quantity" @blur="onQtyBlur(item, $event)" />
                <a href="javascript:void(0)" @click="plus(item)">+</a>
              </div>
            </div>
            <div class="c_sum">
              <p>¥<i>{{ item.price * item.quantity }}</i></p>
            </div>
            <div class="c_action">
              <i class="i_del" data-role="del" @click="del(item)">删除</i>
            </div>
            <div class="c_check">
              <input data-role="product" type="checkbox" :checked="selected.has(item.sid)" @change="toggle(item.sid)" />
            </div>
          </div>
        </template>
        <p v-else style="height: 200px; width: 800px; text-align: center; line-height: 200px; font-size: 36px">
          没有任何商品
        </p>
      </div>
      <!-- 底部结算按钮box -->
      <div class="cart_con">
        <div class="c_balance">
          <div class="c_count">
            <p class="c_clearfix">
              <span class="c_rt">¥<i class="fs_14">{{ goodsTotal }}</i></span>
              <span class="c_lt">商品金额：</span>
              <span class="c_piece">共<i>{{ checkedCount }}</i>件商品</span>
            </p>
            <p class="c_clearfix">
              <span class="c_rt">－¥<i class="fs_14">0</i></span>
              <span class="c_lt">优惠金额：</span>
            </p>
            <p class="c_clearfix">
              <span class="c_rt c_paid">¥<i>{{ payable }}</i></span>
              <span class="c_lt fw_b">实付金额：</span>
            </p>
          </div>
        </div>
        <div class="bot_jie clearfix">
          <div class="fl">
            <input class="quanxian" type="checkbox" v-model="allChecked" />
            <span>全选</span>
          </div>
          <div class="fr">
            <a href="" class="balance_bt" @click.prevent>立即结算</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>