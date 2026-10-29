<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { api, type AdminUser } from '@/api/client'

/**
 * 用户列表（admin 联动批次 3 实装）。
 * 蓝本：src-one（2018）user.js——原版在 Node 层 splice 分页且 "count" 取
 * 当前页条数（分页失真，缺陷清单#3），重写为服务端真分页 + 真实 total；
 * 原版 /user/amend 明文改密，重写为 scrypt 重置密码。
 * admin 角色账号禁删（server 侧强校验，前端按钮同步禁用）。
 */

const items = ref<AdminUser[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const keyword = ref('')

// 新建用户 Dialog
const createDialog = ref(false)
const createForm = reactive({ username: '', password: '' })

// 重置密码 Dialog
const resetTarget = ref<AdminUser | null>(null)
const resetForm = reactive({ password: '' })

async function load() {
  loading.value = true
  try {
    const data = await api.adminUsers({
      page: page.value,
      pageSize: pageSize.value,
      q: keyword.value,
    })
    items.value = data.items
    total.value = data.total
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

function openCreate() {
  createForm.username = ''
  createForm.password = ''
  createDialog.value = true
}

async function onCreate() {
  try {
    await api.adminUserCreate({ ...createForm })
    ElMessage.success('用户已创建（scrypt 哈希）')
    createDialog.value = false
    await load()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '创建失败')
  }
}

function openReset(user: AdminUser) {
  resetTarget.value = user
  resetForm.password = ''
}

async function onReset() {
  if (!resetTarget.value) return
  try {
    await api.adminUserResetPassword(resetTarget.value.id, resetForm.password)
    ElMessage.success(`已重置 ${resetTarget.value.username} 的密码`)
    resetTarget.value = null
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '重置失败')
  }
}

async function onRemove(user: AdminUser) {
  try {
    await ElMessageBox.confirm(
      `删除用户「${user.username}」将同时清理其购物车记录，确定？`,
      '删除用户',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  try {
    await api.adminUserRemove(user.id)
    ElMessage.success('用户已删除')
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
        <span class="title">用户列表</span>
        <span class="dim">total={{ total }}（真 count，修正原版取当前页条数的分页缺陷）</span>
        <el-input
          v-model="keyword"
          placeholder="搜索用户名"
          clearable
          style="width: 200px; margin-left: auto"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
        <el-button type="primary" @click="openCreate">新建用户</el-button>
      </div>
    </template>

    <el-table :data="items" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="64" />
      <el-table-column prop="username" label="用户名" min-width="160" />
      <el-table-column label="角色" width="110">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
            {{ row.role === 'admin' ? '管理员' : '用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openReset(row as AdminUser)">重置密码</el-button>
          <el-button
            size="small"
            type="danger"
            :disabled="row.role === 'admin'"
            :title="row.role === 'admin' ? '管理员账号不可删除' : ''"
            @click="onRemove(row as AdminUser)"
          >
            删除
          </el-button>
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

    <!-- 新建用户 -->
    <el-dialog v-model="createDialog" title="新建用户" width="420px">
      <el-form label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="createForm.username" placeholder="3-11 位小写字母或数字" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="createForm.password" type="password" show-password placeholder="不少于 6 位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="onCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码 -->
    <el-dialog
      :model-value="resetTarget != null"
      :title="`重置密码：${resetTarget?.username ?? ''}`"
      width="420px"
      @update:model-value="(v: string | number | boolean) => { if (!v) resetTarget = null }"
    >
      <el-form label-width="80px">
        <el-form-item label="新密码" required>
          <el-input v-model="resetForm.password" type="password" show-password placeholder="不少于 6 位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetTarget = null">取消</el-button>
        <el-button type="primary" @click="onReset">重置</el-button>
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
</style>
