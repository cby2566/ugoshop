<!--
  商品图放大镜（原站 lib/js.js 的 MagnifierF 插件按行为等价以 Vue 重写，类名不变）：
  - 主图 hover 出现半透明选区框（MagnifierDrag，主图 1/2 尺寸）与右侧 2 倍放大层
    （MagnifierPop > MagnifierImg），选区与放大图按比例反向联动，坐标公式照搬原实现；
  - 缩略图 hover 切换主图（原版 data-lsrc/maxSrc 实为同图，此处单数组）；
  - 左右箭头按原版 specFn 逻辑：缩略图 > 4 张才可用，逐格滚动（原版 buttur
    20ms 递归缓动由 CSS transition 等效）。
-->
<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ imgs: string[] }>()

const mainEl = ref<HTMLElement | null>(null)
const cur = ref(0)
const hover = ref(false)
const drag = ref({ x: 0, y: 0 })
const big = ref({ left: 0, top: 0 })
const n = ref(0) // 缩略图滚动格数（原版 moveFn 的 n）

const len = computed(() => props.imgs.length)
const arrowsOn = computed(() => len.value > 4)
const leftOn = ref(false)
const rightOn = ref(false)
const liW = 70 // 缩略图步进：li 65px + margin 5px（原版 offsetWidth+5 实测同值）

const dragSize = ref({ w: 0, h: 0 })
const popSize = ref({ w: 0, h: 0 })

function onEnter(e: MouseEvent) {
  const el = mainEl.value
  if (!el) return
  const mW = el.offsetWidth
  const mH = el.offsetHeight
  dragSize.value = { w: mW / 2, h: mH / 2 }
  popSize.value = { w: mW, h: mH }
  hover.value = true
  onMove(e) // 原版 setEleFn 后立即以当前鼠标位置渲染
}

function onMove(e: MouseEvent) {
  const el = mainEl.value
  if (!el || !hover.value) return
  const r = el.getBoundingClientRect()
  const mW = r.width
  const mH = r.height
  const dW = dragSize.value.w
  const dH = dragSize.value.h

  // 原版 setMousemoveFn：选区中心跟随鼠标，clamp 在主图内
  let x = e.clientX - r.left - dW / 2
  let y = e.clientY - r.top - dH / 2
  const lx = mW - dW
  const ly = mH - dH
  x = Math.max(0, Math.min(x, lx))
  y = Math.max(0, Math.min(y, ly))
  drag.value = { x, y }

  // 放大图反向比例映射：big 尺寸 = 主图 2 倍
  const l2 = -(mW * 2 - mW)
  const t2 = -(mH * 2 - mH)
  big.value = { left: lx ? (x / lx) * l2 : 0, top: ly ? (y / ly) * t2 : 0 }
}

function onLeave() {
  hover.value = false
}

function select(i: number) {
  cur.value = i
}

// 原版 moveFn：右箭头滚到 _len-4 格封顶，左箭头对称
function next() {
  if (!arrowsOn.value) return
  const r = ++n.value
  if (r > len.value - 5) rightOn.value = false
  if (r > len.value - 4) {
    n.value = len.value - 4
    return
  }
  leftOn.value = true
}

function prev() {
  if (!arrowsOn.value) return
  const l = --n.value
  if (l < 1) leftOn.value = false
  if (l < 0) {
    n.value = 0
    return
  }
  rightOn.value = true
}
</script>

<template>
  <div id="MagnifierWrap2" class="goods_key_l fl">
    <div
      ref="mainEl"
      class="MagnifierMain goods_key_img"
      @mouseenter="onEnter"
      @mousemove="onMove"
      @mouseleave="onLeave"
    >
      <img class="MagTargetImg" :src="imgs[cur]" alt="" />
      <div
        v-if="hover"
        class="MagnifierDrag"
        :style="{
          left: drag.x + 'px',
          top: drag.y + 'px',
          width: dragSize.w + 'px',
          height: dragSize.h + 'px',
        }"
      >&nbsp;</div>
    </div>

    <!-- 右侧 2 倍放大层（原版挂在 wrap 末尾，right = -(主图宽+10)） -->
    <div
      v-if="hover"
      class="MagnifierPop"
      :style="{
        width: popSize.w + 'px',
        height: popSize.h + 'px',
        right: -(popSize.w + 10) + 'px',
      }"
    >
      <div
        class="MagnifierImg"
        :style="{
          width: popSize.w * 2 + 'px',
          height: popSize.h * 2 + 'px',
          left: big.left + 'px',
          top: big.top + 'px',
        }"
      >
        <img style="width: 100%; height: 100%" :src="imgs[cur]" alt="" />
      </div>
    </div>

    <span class="spe_leftBtn" :class="{ on: leftOn }" @click="prev">&lt;</span>
    <span class="spe_rightBtn" :class="{ on: arrowsOn && rightOn }" @click="next">&gt;</span>

    <div class="spec-items">
      <ul :style="{ left: -(n * liW) + 'px' }">
        <li
          v-for="(im, i) in imgs"
          :key="i"
          :class="{ on: i === cur }"
          @mouseover="select(i)"
        >
          <img :src="im" alt="" />
        </li>
      </ul>
    </div>

    <div class="fenx">
      <i></i>
      <span>分享</span>
      <i></i>
      <span>关注</span>
    </div>
  </div>
</template>
