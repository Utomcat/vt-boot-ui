<template>
  <div>
    <div class="page-title">菜单管理</div>
    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <span class="toolbar-tip">维护目录、页面与按钮权限, 页面组件标识需与前端的组件注册表一致</span>
        <el-button type="primary" icon="Refresh" @click="load">刷新</el-button>
        <el-button v-perm="'system:menu:add'" type="success" icon="Plus" @click="openCreate()">新增顶级菜单</el-button>
      </div>

      <el-table
        :data="tree"
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="菜单名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)" size="small">{{ typeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由地址" min-width="150" show-overflow-tooltip />
        <el-table-column prop="component" label="组件标识" min-width="180" show-overflow-tooltip />
        <el-table-column prop="permission" label="权限码" min-width="170" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column label="显示" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.visible === 1 ? 'success' : 'info'" size="small">
              {{ row.visible === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.type !== 'BUTTON'"
              v-perm="'system:menu:add'"
              link
              type="primary"
              @click="openCreate(row)"
            >
              新增子项
            </el-button>
            <el-button v-perm="'system:menu:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-perm="'system:menu:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? '新增菜单' : '编辑菜单'"
      width="640px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            default-expand-all
            placeholder="选择上级菜单"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="DIR">目录</el-radio>
            <el-radio value="MENU">页面</el-radio>
            <el-radio value="BUTTON">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="菜单显示名称" />
        </el-form-item>
        <el-form-item v-if="form.type !== 'BUTTON'" label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="以 / 开头的绝对路径, 如 /system/user" />
        </el-form-item>
        <el-form-item v-if="form.type === 'MENU'" label="组件标识" prop="component">
          <el-input v-model="form.component" placeholder="如 system/user/UserList, 需在前端注册表中存在" />
        </el-form-item>
        <el-form-item v-if="form.type !== 'BUTTON'" label="图标名称" prop="icon">
          <el-input v-model="form.icon" placeholder="Element Plus 图标名, 如 User" />
        </el-form-item>
        <el-form-item v-if="form.type !== 'DIR'" label="权限码" prop="permission">
          <el-input v-model="form.permission" placeholder="如 system:user:add" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="侧边显示" prop="visible">
              <el-switch v-model="form.visible" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createMenu, deleteMenu, fetchMenuTree, updateMenu } from '../../../api/rbac'
import { MenuVO } from '../../../data/rbac/MenuVO'
import { MenuForm } from '../../../data/rbac/MenuForm'

// 菜单树加载状态
const loading = ref(false)
// 提交状态
const submitting = ref(false)
// 菜单树
const tree = ref<MenuVO[]>([])
// 上级菜单候选(排除按钮节点)
const parentOptions = computed<MenuVO[]>(() => filterSelectable(tree.value))

// 弹窗状态
const dialog = reactive<{ visible: boolean; mode: 'create' | 'edit' }>({ visible: false, mode: 'create' })
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<MenuForm>({
  id: undefined,
  parentId: 0,
  name: '',
  type: 'MENU',
  path: '',
  component: '',
  icon: '',
  permission: '',
  sort: 0,
  visible: 1,
  status: 1,
})

// 表单校验规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
}

/**
 * 过滤出可作为上级菜单的节点(按钮不能作为上级)
 *
 * @param nodes 菜单树
 * @returns 过滤后的菜单树
 */
function filterSelectable(nodes: MenuVO[]): MenuVO[] {
  const result: MenuVO[] = []
  for (const node of nodes) {
    if (node.type === 'BUTTON') continue
    result.push({
      ...node,
      children: node.children && node.children.length ? filterSelectable(node.children) : undefined,
    })
  }
  return result
}

/**
 * 类型中文说明
 *
 * @param type 类型编码
 * @returns 中文说明
 */
const typeLabel = (type: string): string => {
  if (type === 'DIR') return '目录'
  if (type === 'MENU') return '页面'
  if (type === 'BUTTON') return '按钮'
  return type
}

/**
 * 类型对应的标签样式
 *
 * @param type 类型编码
 * @returns 标签类型
 */
const typeTagType = (type: string): string => {
  if (type === 'DIR') return 'warning'
  if (type === 'MENU') return 'primary'
  return 'info'
}

/**
 * 加载菜单树
 */
const load = async () => {
  loading.value = true
  try {
    const res = await fetchMenuTree()
    tree.value = res.data || []
  } finally {
    loading.value = false
  }
}

/**
 * 打开新增弹窗
 *
 * @param parent 上级菜单, 为空表示新增顶级菜单
 */
const openCreate = (parent?: MenuVO) => {
  dialog.mode = 'create'
  form.parentId = parent ? parent.id : 0
  form.type = parent && parent.type === 'MENU' ? 'BUTTON' : 'MENU'
  dialog.visible = true
}

/**
 * 打开编辑弹窗
 *
 * @param row 菜单行数据
 */
const openEdit = (row: MenuVO) => {
  dialog.mode = 'edit'
  form.id = row.id
  form.parentId = row.parentId ?? 0
  form.name = row.name
  form.type = row.type
  form.path = row.path || ''
  form.component = row.component || ''
  form.icon = row.icon || ''
  form.permission = row.permission || ''
  form.sort = row.sort ?? 0
  form.visible = row.visible ?? 1
  form.status = row.status ?? 1
  dialog.visible = true
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.id = undefined
  form.parentId = 0
  form.name = ''
  form.type = 'MENU'
  form.path = ''
  form.component = ''
  form.icon = ''
  form.permission = ''
  form.sort = 0
  form.visible = 1
  form.status = 1
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload: MenuForm = {
        ...form,
        parentId: form.parentId || 0,
        path: form.type === 'BUTTON' ? undefined : form.path,
        component: form.type === 'MENU' ? form.component : undefined,
        permission: form.type === 'DIR' ? undefined : form.permission,
      }
      if (dialog.mode === 'create') {
        await createMenu(payload)
        ElMessage.success('新增菜单成功')
      } else {
        await updateMenu(payload)
        ElMessage.success('修改菜单成功')
      }
      dialog.visible = false
      await load()
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 删除菜单
 *
 * @param row 菜单行数据
 */
const handleDelete = async (row: MenuVO) => {
  await ElMessageBox.confirm(`删除菜单「${row.name}」会同时移除角色上的授权, 确定删除？`, '提示', { type: 'warning' })
  await deleteMenu(row.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>
