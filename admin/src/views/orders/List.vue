<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { api, type AdminOrder } from '@/api/client'

/**
 * 订单列表（admin 联动批次 3 实装）。
 * 蓝本：src-one（2018）car.js + carcar.js——"订单管理"读 car 表，
 * 2018 年购物车即订单的历史语义原样保留（菜单名不动，此注释留档）。
 * 原版查了关联用户名的 SQL 却从未使用（死代码缺陷），重写把三表 JOIN 真正用上；
 * 删除单条为管理清理能力（原版无对应接口，重写增强）。
 */

const items = ref<AdminOrder[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const keyword = ref('')
const stats = ref({ totalOrders: 0, totalQuantity: 0, totalAmount: 0 })

async function load() {
  loading.value = true
  try {
    const data = await api.adminOrders({
      page: page.value,
      pageSize: pageSize.value,
      q: keyword.value,
    })
    items.value = data.items
    total.value = data.total
    stats.value = data.stats
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

async function onSearch() {
  page.value = 1
  await load()
}

async function onRemove(order: AdminOrder) {
  try {
    await ElMessageBox.confirm(
      `删除「${order.username}」的「${order.name}」（订单 ID ${order.id}）记录？`,
      '删除订单记录',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  try {
    await api.adminOrderRemove(order.id)
    ElMessage.success('订单记录已删除')
    if (items.value.length === 1 && page.value > 1) page.value -= 1
    await load()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <el-card>
    <template #header>
      <div class="toolbar">
        <span class="title">订单列表</span>
        <span class="dim">数据源 cart 表——沿袭 2018 年「car 即订单」原始语义</span>
        <el-input
          v-model="keyword"
          placeholder="搜索用户名/商品名"
          clearable
          style="width: 220px; margin-left: auto"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
      </div>
    </template>

    <div class="stat-row">
      <el-statistic title="订单记录" :value="stats.totalOrders" />
      <el-statistic title="商品总件数" :value="stats.totalQuantity" />
      <el-statistic title="总金额（全部记录）" :value="stats.totalAmount" :formatter="(v: number) => `¥${v.toLocaleString('zh-CN')}`" />
    </div>

    <el-table :data="items" v-loading="loading" border stripe style="margin-top: 16px">
      <el-table-column prop="id" label="订单ID" width="80" />
      <el-table-column prop="username" label="用户" width="140" />
      <el-table-column prop="sid" label="商品SID" width="90" />
      <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
      <el-table-column label="单价" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column label="小计" width="110">
        <template #default="{ row }">
          <span class="sub">¥{{ row.price * row.quantity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="onRemove(row as AdminOrder)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无订单记录——在前台登录并加入购物车即可产生数据" />
      </template>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 16px; justify-content: flex-end"
      @current-change="load"
      @size-change="onSearch"
    />
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-weight: 600;
}

.dim {
  color: #909399;
  font-size: 12px;
}

.stat-row {
  display: flex;
  gap: 48px;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 6px;
}

.sub {
  color: #f56c6c;
  font-weight: 600;
}
</style>
