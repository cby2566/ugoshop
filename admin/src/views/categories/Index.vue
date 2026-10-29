<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  api,
  type AdminCategory,
  type AdminCategoryItem,
} from '@/api/client'

/**
 * 商品分类管理（admin 联动批次 3 实装）。
 * 蓝本：src-one（2018）goods.js 的 /goods/classify(+add/amend)——扁平一级
 * qid/qname 增删改；重写为两级（categories + categoryItems，对齐前台菜单）。
 * C 端 /api/menu 直读这两张表——此处任何改动前台菜单即时生效。
 */

const cats = ref<AdminCategory[]>([])
const loading = ref(false)

// 一级分类 Dialog
const catDialog = ref(false)
const editingCatId = ref<number | null>(null)
const catForm = reactive({ title: '', icon: '', sort: 0 })

// 二级项 Dialog
const itemDialog = ref(false)
const itemCatId = ref<number | null>(null)
const editingItemId = ref<number | null>(null)
const itemForm = reactive({ name: '', sort: 0 })

async function load() {
  loading.value = true
  try {
    cats.value = await api.adminCategories()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function openCatCreate() {
  editingCatId.value = null
  catForm.title = ''
  catForm.icon = ''
  catForm.sort = 0
  catDialog.value = true
}

function openCatEdit(cat: AdminCategory) {
  editingCatId.value = cat.id
  catForm.title = cat.title
  catForm.icon = cat.icon
  catForm.sort = cat.sort
  catDialog.value = true
}

async function onCatSave() {
  if (!catForm.title.trim()) {
    ElMessage.warning('分类名称必填')
    return
  }
  try {
    if (editingCatId.value == null) {
      await api.adminCategoryCreate({ title: catForm.title.trim(), icon: catForm.icon.trim() })
      ElMessage.success('一级分类已创建（前台菜单即时生效）')
    } else {
      await api.adminCategoryUpdate(editingCatId.value, {
        title: catForm.title.trim(),
        icon: catForm.icon.trim() || undefined,
        sort: catForm.sort,
      })
      ElMessage.success('一级分类已更新')
    }
    catDialog.value = false
    await load()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  }
}

async function onCatRemove(cat: AdminCategory) {
  try {
    await ElMessageBox.confirm(
      `删除一级分类「${cat.title}」将同时删除其下 ${cat.items.length} 个二级项，确定？`,
      '删除分类',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  try {
    await api.adminCategoryRemove(cat.id)
    ElMessage.success('分类已删除')
    await load()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '删除失败')
  }
}

function openItemCreate(cat: AdminCategory) {
  itemCatId.value = cat.id
  editingItemId.value = null
  itemForm.name = ''
  itemForm.sort = cat.items.length
  itemDialog.value = true
}

function openItemEdit(cat: AdminCategory, item: AdminCategoryItem) {
  itemCatId.value = cat.id
  editingItemId.value = item.id
  itemForm.name = item.name
  itemForm.sort = item.sort
  itemDialog.value = true
}

async function onItemSave() {
  if (itemCatId.value == null || !itemForm.name.trim()) {
    ElMessage.warning('二级项名称必填')
    return
  }
  try {
    if (editingItemId.value == null) {
      await api.adminCategoryItemCreate(itemCatId.value, { name: itemForm.name.trim() })
      ElMessage.success('二级项已创建')
    } else {
      await api.adminCategoryItemUpdate(itemCatId.value, editingItemId.value, {
        name: itemForm.name.trim(),
        sort: itemForm.sort,
      })
      ElMessage.success('二级项已更新')
    }
    itemDialog.value = false
    await load()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  }
}

async function onItemRemove(item: AdminCategoryItem) {
  try {
    await ElMessageBox.confirm(`删除二级项「${item.name}」，确定？`, '删除二级项', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await api.adminCategoryItemRemove(item.id)
    ElMessage.success('二级项已删除')
    await load()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="toolbar">
        <span class="title">商品分类（两级）</span>
        <span class="dim">改动即时同步前台菜单（/api/menu 直读本表）</span>
        <el-button type="primary" style="margin-left: auto" @click="openCatCreate">
          新建一级分类
        </el-button>
      </div>
    </template>

    <el-empty v-if="cats.length === 0" description="暂无分类" />

    <el-card
      v-for="cat in cats"
      :key="cat.id"
      shadow="never"
      class="cat-card"
    >
      <template #header>
        <div class="cat-head">
          <span class="cat-title">{{ cat.title }}</span>
          <el-tag size="small" type="info">{{ cat.items.length }} 个二级项</el-tag>
          <span class="dim">sort={{ cat.sort }} · icon={{ cat.icon }}</span>
          <span style="margin-left: auto; display: inline-flex; gap: 8px">
            <el-button size="small" @click="openItemCreate(cat as AdminCategory)">新增二级项</el-button>
            <el-button size="small" @click="openCatEdit(cat as AdminCategory)">编辑</el-button>
            <el-button size="small" type="danger" @click="onCatRemove(cat as AdminCategory)">删除</el-button>
          </span>
        </div>
      </template>

      <el-table :data="cat.items" size="small" border>
        <el-table-column prop="id" label="ID" width="64" />
        <el-table-column prop="name" label="二级项名称" min-width="160" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" @click="openItemEdit(cat as AdminCategory, row as AdminCategoryItem)">编辑</el-button>
            <el-button size="small" type="danger" @click="onItemRemove(row as AdminCategoryItem)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>暂无二级项</template>
      </el-table>
    </el-card>

    <!-- 一级分类 Dialog -->
    <el-dialog
      v-model="catDialog"
      :title="editingCatId == null ? '新建一级分类' : '编辑一级分类'"
      width="420px"
    >
      <el-form label-width="90px">
        <el-form-item label="分类名称" required>
          <el-input v-model="catForm.title" placeholder="如：品质厨房" />
        </el-form-item>
        <el-form-item label="图标文件名">
          <el-input v-model="catForm.icon" placeholder="newsix_03.png（留空用默认）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="catForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="catDialog = false">取消</el-button>
        <el-button type="primary" @click="onCatSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 二级项 Dialog -->
    <el-dialog
      v-model="itemDialog"
      :title="editingItemId == null ? '新增二级项' : '编辑二级项'"
      width="420px"
    >
      <el-form label-width="90px">
        <el-form-item label="名称" required>
          <el-input v-model="itemForm.name" placeholder="如：休闲食品" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="itemForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialog = false">取消</el-button>
        <el-button type="primary" @click="onItemSave">保存</el-button>
      </template>
    </el-dialog>
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

.cat-card {
  margin-bottom: 16px;
}

.cat-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cat-title {
  font-weight: 600;
}
</style>
