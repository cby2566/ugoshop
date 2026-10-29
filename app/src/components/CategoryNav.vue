<!--
  红色导航条 + hover 展开的分类菜单（原站 #xnav 原样移植）。
  菜单数据由原站 newMenu.js 硬数据改为 GET /api/menu（server 端 categories 表），
  icon 为原文件名，拼 /museum/css-img/ 前缀，与原站 ../css/img/ 同源素材。
  导航接线（收尾）：原版各页均 void(0)；重写为「首页」→ /、「食品」→ /list，
  其余项（视频/家居/美妆/服饰/音乐之声）原版无对应页面，保持原样。
-->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useMenuStore } from '@/stores/menu'

const menu = useMenuStore()
const router = useRouter()
onMounted(() => menu.fetchMenu())
</script>

<template>
  <article id="xnav">
    <nav class="xnav con">
      <ul>
        <li><a href="javascript:void(0)" @click="router.push('/')">首页</a></li>
        <li><a href="javascript:void(0)" class="shiping">视频</a></li>
        <li><a href="javascript:void(0)" @click="router.push('/list')">食品</a></li>
        <li><a href="javascript:void(0)">家居</a></li>
        <li><a href="javascript:void(0)">美妆</a></li>
        <li><a href="javascript:void(0)">服饰</a></li>
        <li><a href="javascript:void(0)">音乐之声</a></li>
        <li><span></span></li>
      </ul>
      <div class="xnav_h">
        <div class="kinds" v-for="(v, i) in menu.items" :key="i">
          <div class="kinds_top">
            <div class="stat">
              <img :src="'/museum/css-img/' + v.icon" height="42" width="30" alt="" />
            </div>
            <a href="javascript:void(0)">{{ v.title }}</a>
          </div>
          <div class="kindsbot">
            <a href="javascript:void(0)" v-for="(j, x) of v.items" :key="x">{{ j }}</a>
          </div>
        </div>
      </div>
    </nav>
  </article>
</template>
