<template>
  <div>
    <div class="page-title">角色管理</div>
    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <span class="toolbar-label">角色名称：</span>
        <el-input
          v-model="query.name"
          placeholder="模糊匹配名称"
          clearable
          style="width: 160px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">角色编码：</span>
        <el-input
          v-model="query.code"
          placeholder="模糊匹配编码"
          clearable
          style="width: 160px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">状态：</span>
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 120px" @change="handleSearch">
          <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button v-perm="'system:role:add'" type="success" icon="Plus" @click="openCreate">新增角色</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="name" label="角色名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="description" label="角色描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.builtin === 1 ? 'warning' : 'info'" size="small">
              {{ row.builtin === 1 ? '内置' : '自定义' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              v-perm="'system:role:edit'"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.builtin === 1"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button v-perm="'system:role:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button
              v-perm="'system:role:delete'"
              link
              type="danger"
              :disabled="row.builtin === 1"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="page-pagination"
        v-model:page-size="page.size"
        v-model:current-page="page.current"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @current-change="load"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? '新增角色' : '编辑角色'"
      width="760px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="角色编码" prop="code">
              <el-input v-model="form.code" :disabled="dialog.mode === 'edit'" placeholder="如 OPERATOR" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="form.name" placeholder="如 运营专员" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">正常</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="角色描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="2" placeholder="可留空" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单授权">
              <div class="perm-tree">
                <el-tree
                  ref="treeRef"
                  :data="menuTree"
                  :props="{ label: 'name', children: 'children' }"
                  node-key="id"
                  show-checkbox
                  default-expand-all
                  :check-strictly="false"
                >
                  <template #default="{ data }">
                    <span class="tree-node">
                      <span>{{ data.name }}</span>
                      <el-tag v-if="data.type === 'BUTTON'" size="small" type="info" class="tree-tag">按钮</el-tag>
                      <span v-if="data.permission" class="tree-code">{{ data.permission }}</span>
                    </span>
                  </template>
                </el-tree>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, TreeInstance } from 'element-plus'
import {
  changeRoleStatus,
  createRole,
  deleteRole,
  fetchMenuTree,
  fetchRoleDetail,
  fetchRolePage,
  updateRole,
} from '../../../api/rbac'
import { RoleVO } from '../../../data/rbac/RoleVO'
import { RoleForm } from '../../../data/rbac/RoleForm'
import { MenuVO } from '../../../data/rbac/MenuVO'
import { STATUS_OPTIONS } from '../../../data/system/SystemConstants'
import { formatDateTime } from '../../../utils/date'

// 列表加载状态
const loading = ref(false)
// 提交状态
const submitting = ref(false)
// 角色列表
const list = ref<RoleVO[]>([])
// 数据总数
const total = ref(0)
// 分页参数
const page = reactive({ current: 1, size: 10 })
// 查询条件
const query = reactive<{ name: string; code: string; status: number | undefined }>({
  name: '',
  code: '',
  status: undefined,
})

// 菜单树(含按钮节点, 用于授权)
const menuTree = ref<MenuVO[]>([])
// 弹窗状态
const dialog = reactive<{ visible: boolean; mode: 'create' | 'edit' }>({ visible: false, mode: 'create' })
const formRef = ref<FormInstance>()
const treeRef = ref<TreeInstance>()

// 表单数据
const form = reactive<RoleForm>({
  id: undefined,
  code: '',
  name: '',
  description: '',
  sort: 0,
  status: 1,
  menuIds: [],
})

// 表单校验规则
const rules: FormRules = {
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Za-z][A-Za-z0-9_]{1,31}$/, message: '编码为 2-32 位字母、数字或下划线, 且以字母开头', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
}

/**
 * 加载角色列表
 */
const load = async () => {
  loading.value = true
  try {
    const res = await fetchRolePage({
      page: page.current,
      size: page.size,
      name: query.name || undefined,
      code: query.code || undefined,
      status: query.status,
    })
    list.value = res.data || []
    total.value = Number(res.total) || 0
  } finally {
    loading.value = false
  }
}

/**
 * 加载菜单树
 */
const loadMenuTree = async () => {
  const res = await fetchMenuTree()
  menuTree.value = res.data || []
}

const handleSearch = () => {
  page.current = 1
  load()
}

const handleReset = () => {
  query.name = ''
  query.code = ''
  query.status = undefined
  page.current = 1
  load()
}

const handleSizeChange = () => {
  page.current = 1
  load()
}

const openCreate = async () => {
  dialog.mode = 'create'
  if (!menuTree.value.length) await loadMenuTree()
  dialog.visible = true
  await nextTick()
  treeRef.value?.setCheckedKeys([], false)
}

const openEdit = async (row: RoleVO) => {
  dialog.mode = 'edit'
  if (!menuTree.value.length) await loadMenuTree()
  const res = await fetchRoleDetail(row.id)
  const detail = res.data
  form.id = detail.id
  form.code = detail.code
  form.name = detail.name
  form.description = detail.description || ''
  form.sort = detail.sort ?? 0
  form.status = detail.status ?? 1
  dialog.visible = true
  await nextTick()
  // 仅回填叶子节点, 父节点由组件按半选规则自动推导, 避免整棵父节点被误判为全选
  const checked = detail.menuIds || []
  const allIds = new Set(collectIds(menuTree.value))
  const leafChecked = checked.filter((id) => !hasChild(id, menuTree.value))
  treeRef.value?.setCheckedKeys(leafChecked.filter((id) => allIds.has(id)), false)
}

/**
 * 收集树中全部节点 ID
 *
 * @param nodes 菜单树
 * @returns 节点 ID 列表
 */
const collectIds = (nodes: MenuVO[]): number[] => {
  const ids: number[] = []
  const walk = (items: MenuVO[]) => {
    for (const item of items) {
      ids.push(item.id)
      if (item.children && item.children.length) walk(item.children)
    }
  }
  walk(nodes)
  return ids
}

/**
 * 判断节点是否存在下级
 *
 * @param id    节点 ID
 * @param nodes 菜单树
 * @returns 是否存在下级
 */
const hasChild = (id: number, nodes: MenuVO[]): boolean => {
  for (const item of nodes) {
    if (item.id === id) return Boolean(item.children && item.children.length)
    if (item.children && item.children.length && hasChild(id, item.children)) return true
  }
  return false
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.id = undefined
  form.code = ''
  form.name = ''
  form.description = ''
  form.sort = 0
  form.status = 1
  form.menuIds = []
  treeRef.value?.setCheckedKeys([], false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const checked = treeRef.value?.getCheckedKeys(false) || []
      const halfChecked = treeRef.value?.getHalfCheckedKeys() || []
      const menuIds = Array.from(new Set([...(checked as number[]), ...(halfChecked as number[])]))
      const payload: RoleForm = { ...form, menuIds }
      if (dialog.mode === 'create') {
        await createRole(payload)
        ElMessage.success('新增角色成功')
      } else {
        await updateRole(payload)
        ElMessage.success('修改角色成功')
      }
      dialog.visible = false
      await load()
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 启用 / 禁用角色, 失败时回滚开关状态
 *
 * @param row 角色行数据
 */
const handleStatusChange = async (row: RoleVO) => {
  try {
    await changeRoleStatus(row.id, row.status ?? 0)
    ElMessage.success(row.status === 1 ? '已启用该角色' : '已禁用该角色')
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

/**
 * 删除角色(逻辑删除)
 *
 * @param row 角色行数据
 */
const handleDelete = async (row: RoleVO) => {
  await ElMessageBox.confirm(`删除角色「${row.name}」后不可恢复, 确定删除？`, '提示', { type: 'warning' })
  await deleteRole(row.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(async () => {
  await Promise.all([load(), loadMenuTree()])
})
</script>

<style scoped>
.perm-tree {
  width: 100%;
  max-height: 320px;
  overflow: auto;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fbfdff;
}
.tree-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.tree-tag {
  transform: scale(0.9);
}
.tree-code {
  font-size: 11px;
  color: #94a3b8;
}
</style>
