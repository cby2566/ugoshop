<script setup lang="ts">
import { onMounted } from 'vue'

import { useProductsStore } from '@/stores/products'

const store = useProductsStore()

onMounted(() => store.fetchProducts())
</script>

<template>
  <section class="home">
    <h2 class="title">商品列表（SQLite 种子数据 · {{ store.items.length }} 条）</h2>

    <el-alert
      v-if="store.error"
      :title="`接口调用失败：${store.error}`"
      type="error"
      show-icon
      :closable="false"
    />

    <el-skeleton v-else-if="store.loading" :rows="6" animated />

    <el-table v-else :data="store.items" stripe>
      <el-table-column label="SID" prop="sid" width="64" />
      <el-table-column label="商品" min-width="260">
        <template #default="{ row }">
          <div class="cell-product">
            <el-image
              v-if="row.image"
              :src="row.image"
              fit="cover"
              class="thumb"
              :preview-src-list="[row.image]"
              preview-teleported
            />
            <div v-else class="thumb thumb-fallback">暂无图</div>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="品牌" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.brand }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column label="描述" prop="description" min-width="280" show-overflow-tooltip />
    </el-table>
  </section>
</template>

<style scoped>
.title {
  font-size: 16px;
  margin: 0 0 16px;
}

.cell-product {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  flex: none;
}

.thumb-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
  font-size: 10px;
}
</style>
