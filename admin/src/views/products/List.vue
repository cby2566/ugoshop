<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  api,
  type AdminProduct,
  type AdminProductQuery,
} from '@/api/client'

/**
 * 商品列表（admin 联动批次 2 实装）。
 * 蓝本：src-one（2018）lay/html/modules/goodlist.js + router/goods.js——
 * LayUI table 分页/上下架/增删改，重写为 Element Plus 表格 + REST；
 * 上下架开关即原版 updown（DIAN=1/2）的 1/0 归一化，切换后 C 端列表/详情即时生效。
 */

const items = ref<AdminProduct[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 筛选
const keyword = ref('')
const categoryFilter = ref('')
const statusFilter = ref<0 | 1 | ''>('')
const categoryOptions = ref<string[]>([])

// 新建/编辑对话框
const dialogVisible = ref(false)
const editingSid = ref<number | null>(null)
const form = reactive({
  name: '',
  brand: '',
  price: 0,
  description: '',
  category: '',
  stock: 0,
  status: 1 as 0 | 1,
})

/** 原站渲染规则（与 C 端 ListView productImage 同源）：image 优先，legacyUrl 拼系列图 */
function productImage(p: AdminProduct): string {
  if (p.image) return p.image
  const name = (p.legacyUrl ?? '').split('/').pop() ?? ''
  return `/museum/img/${name}_1.jpg`
}

async function load() {
  loading.value = true
  try {
    const query: AdminProductQuery = { page: page.value, pageSize: pageSize.value }
    if (keyword.value !== '') query.q = keyword.value
    if (categoryFilter.value !== '') query.category = categoryFilter.value
    if (statusFilter.value !== '') query.status = statusFilter.value
    const data = await api.adminProducts(query)
    items.value = data.items
    total.value = data.total
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

/** 分类下拉：复用 C 端 /api/menu（categories+categoryItems 两级，取二级 item 扁平化） */
async function loadCategoryOptions() {
  try {
    const menu = await api.menu()
    categoryOptions.value = [...new Set(menu.flatMap((m) => m.items))]
  } catch {
    categoryOptions.value = []
  }
}

async function onSearch() {
  page.value = 1
  await load()
}

async function onStatusChange(row: AdminProduct, next: boolean) {
  const status = next ? 1 : 0
  try {
    const updated = await api.adminProductStatus(row.sid, status)
    row.status = updated.status
    ElMessage.success(`SID ${row.sid} 已${status === 1 ? '上架' : '下架'}（前台即时生效）`)
  } catch (err) {
    // 失败回滚开关显示态
    row.status = status === 1 ? 0 : 1
    ElMessage.error(err instanceof Error ? err.message : '操作失败')
  }
}

function openCreate() {
  editingSid.value = null
  Object.assign(form, {
    name: '',
    brand: '',
    price: 0,
    description: '',
    category: '',
    stock: 0,
    status: 1,
  })
  dialogVisible.value = true
}

function openEdit(row: AdminProduct) {
  editingSid.value = row.sid
  Object.assign(form, {
    name: row.name,
    brand: row.brand,
    price: row.price,
    description: row.description,
    category: row.category ?? '',
    stock: row.stock,
    status: row.status as 0 | 1,
  })
  dialogVisible.value = true
}

async function onSave() {
  const payload = { ...form, category: form.category || null }
  try {
    if (editingSid.value == null) {
      await api.adminProductCreate(payload)
      ElMessage.success('商品已创建（sid 自动分配）')
    } else {
      await api.adminProductUpdate(editingSid.value, payload)
      ElMessage.success(`SID ${editingSid.value} 已更新`)
    }
    dialogVisible.value = false
    await load()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  }
}

async function onRemove(row: AdminProduct) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.name}」（SID ${row.sid}）？购物车中的引用将一并清理。`,
      '删除商品',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  try {
    await api.adminProductRemove(row.sid)
    ElMessage.success(`SID ${row.sid} 已删除`)
    // 删除后若当前页只剩一条则回退一页
    if (items.value.length === 1 && page.value > 1) page.value -= 1
    await load()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '删除失败')
  }
}

const statusFilterOptions = computed(() => [
  { label: '全部状态', value: '' },
  { label: '已上架', value: 1 },
  { label: '已下架', value: 0 },
])

onMounted(async () => {
  await Promise.all([load(), loadCategoryOptions()])
})
</script>

<template>
  <el-card>
    <template #header>
      <div class="toolbar">
        <span class="title">商品列表</span>
        <el-input
          v-model="keyword"
          placeholder="搜索名称/品牌"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
        <el-select
          v-model="categoryFilter"
          placeholder="全部分类"
          clearable
          filterable
          style="width: 160px"
          @change="onSearch"
        >
          <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
        </el-select>
        <el-select
          v-model="statusFilter"
          placeholder="全部状态"
          style="width: 130px"
          @change="onSearch"
        >
          <el-option
            v-for="opt in statusFilterOptions"
            :key="opt.label"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-button type="primary" @click="openCreate">新增商品</el-button>
      </div>
    </template>

    <el-table :data="items" v-loading="loading" border stripe>
      <el-table-column label="主图" width="80">
        <template #default="{ row }">
          <el-image
            :src="productImage(row as AdminProduct)"
            fit="cover"
            style="width: 48px; height: 48px; border-radius: 4px"
          >
            <template #error>
              <div class="img-fallback">无图</div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="sid" label="SID" width="64" />
      <el-table-column prop="name" label="名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="brand" label="品牌" width="120" show-overflow-tooltip />
      <el-table-column prop="price" label="价格(¥)" width="90" sortable />
      <el-table-column prop="category" label="分类" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.category" size="small">{{ row.category }}</el-tag>
          <span v-else class="dim">未分类</span>
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="80" sortable />
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column label="上架" width="90">
        <template #default="{ row }">
          <!-- 原版 updown（DIAN）的 1/0 归一化；切换即 C 端可见性联动 -->
          <el-switch
            :model-value="(row as AdminProduct).status === 1"
            @change="(val: string | number | boolean) => onStatusChange(row as AdminProduct, Boolean(val))"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row as AdminProduct)">编辑</el-button>
          <el-button size="small" type="danger" @click="onRemove(row as AdminProduct)">删除</el-button>
        </template>
      </el-table-column>
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

    <el-dialog
      v-model="dialogVisible"
      :title="editingSid == null ? '新增商品' : `编辑商品（SID ${editingSid}）`"
      width="520px"
    >
      <el-form label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="商品名称" />
        </el-form-item>
        <el-form-item label="品牌" required>
          <el-input v-model="form.brand" placeholder="品牌/标签" />
        </el-form-item>
        <el-form-item label="价格(¥)" required>
          <el-input-number v-model="form.price" :min="0" :precision="0" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="选择分类（可空）" clearable filterable>
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" :precision="0" />
        </el-form-item>
        <el-form-item label="上架">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="商品描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title {
  font-weight: 600;
  margin-right: auto;
}

.dim {
  color: #c0c4cc;
  font-size: 12px;
}

.img-fallback {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 12px;
  border-radius: 4px;
}
</style>
