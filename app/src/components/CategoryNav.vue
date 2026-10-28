<!--
  红色导航条 + hover 展开的分类菜单（原站 #xnav 原样移植）。
  菜单数据由原站 newMenu.js 硬数据改为 GET /api/menu（server 端 categories 表），
  icon 为原文件名，拼 /museum/css-img/ 前缀，与原站 ../css/img/ 同源素材。
-->
<script setup lang="ts">
import { onMounted } from 'vue'

import { useMenuStore } from '@/stores/menu'

const menu = useMenuStore()
onMounted(() => menu.fetchMenu())
</script>

<template>
  <article id="xnav">
    <nav class="xnav con">
      <ul>
        <li><a href="javascript:void(0)">首页</a></li>
        <li><a href="javascript:void(0)" class="shiping">视频</a></li>
        <li><a href="javascript:void(0)">食品</a></li>
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
            <a href="">{{ v.title }}</a>
          </div>
          <div class="kindsbot">
            <a href="" v-for="(j, x) of v.items" :key="x">{{ j }}</a>
          </div>
        </div>
      </div>
    </nav>
  </article>
</template>
