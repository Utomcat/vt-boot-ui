<template>
  <div>
    <div class="page-title">用户管理</div>
    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <span class="toolbar-label">用户名：</span>
        <el-input
          v-model="query.username"
          placeholder="模糊匹配登录名"
          clearable
          style="width: 190px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">状态：</span>
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px" @change="handleSearch">
          <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <span class="toolbar-label">角色：</span>
        <el-select v-model="query.role" placeholder="全部角色" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.code" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button v-perm="'system:user:add'" type="success" icon="Plus" @click="openCreate">新增用户</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="username" label="用户名" min-width="130" show-overflow-tooltip />
        <el-table-column prop="realName" label="真实姓名" min-width="120" show-overflow-tooltip />
        <el-table-column label="角色" min-width="150" align="center">
          <template #default="{ row }">
            <template v-if="row.roleNames && row.roleNames.length">
              <el-tag
                v-for="(name, idx) in row.roleNames"
                :key="idx"
                :type="roleTagType(row.roleCodes && row.roleCodes[idx])"
                size="small"
                class="role-tag"
              >
                {{ name }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              v-perm="'system:user:status'"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="170" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" min-width="130" show-overflow-tooltip />
        <el-table-column label="最后登录" min-width="170">
          <template #default="{ row }">
            <div>{{ formatDateTime(row.lastLoginTime) || '-' }}</div>
            <div class="sub-text">{{ row.lastLoginIp || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-perm="'system:user:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-perm="'system:user:reset'" link type="warning" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button v-perm="'system:user:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
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
      :title="dialog.mode === 'create' ? '新增用户' : '编辑用户'"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" :disabled="dialog.mode === 'edit'" placeholder="登录账号, 唯一" />
            </el-form-item>
          </el-col>
          <el-col v-if="dialog.mode === 'create'" :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                show-password
                placeholder="6-32 位密码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="用户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select v-model="form.roleIds" multiple placeholder="可选择一个或多个角色" style="width: 100%">
                <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="example@domain.com" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="11 位手机号" />
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
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="管理员备注, 可留空" />
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
import { changeUserStatus, createUser, deleteUser, fetchUserPage, resetUserPassword, updateUser } from '../../../api/user'
import { fetchRoleOptions } from '../../../api/rbac'
import { UserVO } from '../../../data/system/UserVO'
import { UserForm } from '../../../data/system/UserForm'
import { RoleVO } from '../../../data/rbac/RoleVO'
import { STATUS_OPTIONS, roleTagType } from '../../../data/system/SystemConstants'
import { formatDateTime } from '../../../utils/date'

// 列表加载状态
const loading = ref(false)
// 提交状态
const submitting = ref(false)
// 用户列表
const list = ref<UserVO[]>([])
// 数据总数
const total = ref(0)
// 分页参数
const page = reactive({ current: 1, size: 10 })
// 查询条件
const query = reactive<{ username: string; status: number | undefined; role: string | undefined }>({
  username: '',
  status: undefined,
  role: undefined,
})

// 可选角色列表(来自后端, 用于筛选与分配角色)
const roleOptions = ref<RoleVO[]>([])

/**
 * 加载可选角色列表
 */
const loadRoleOptions = async () => {
  const res = await fetchRoleOptions()
  roleOptions.value = res.data || []
}

// 弹窗状态
const dialog = reactive<{ visible: boolean; mode: 'create' | 'edit' }>({ visible: false, mode: 'create' })
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<UserForm>({
  id: undefined,
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  roleIds: [],
  status: 1,
  remark: '',
})

// 表单校验规则(密码仅新增时填写, 编辑不涉及密码)
const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  roleIds: [{ required: true, type: 'array', message: '请至少选择一个角色', trigger: 'change' }],
  password:
    dialog.mode === 'create'
      ? [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 32, message: '密码长度需为 6-32 位', trigger: 'blur' },
        ]
      : [],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
}))

/**
 * 加载用户列表
 */
const load = async () => {
  loading.value = true
  try {
    const res = await fetchUserPage({
      page: page.current,
      size: page.size,
      username: query.username || undefined,
      status: query.status,
      role: query.role,
    })
    list.value = res.data || []
    total.value = Number(res.total) || 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.current = 1
  load()
}

const handleReset = () => {
  query.username = ''
  query.status = undefined
  query.role = undefined
  page.current = 1
  load()
}

const handleSizeChange = () => {
  page.current = 1
  load()
}

const openCreate = () => {
  dialog.mode = 'create'
  dialog.visible = true
}

const openEdit = (row: UserVO) => {
  dialog.mode = 'edit'
  form.id = row.id
  form.username = row.username
  form.password = ''
  form.realName = row.realName || ''
  form.email = row.email || ''
  form.phone = row.phone || ''
  form.roleIds = row.roleIds ? [...row.roleIds] : []
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  dialog.visible = true
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.id = undefined
  form.username = ''
  form.password = ''
  form.realName = ''
  form.email = ''
  form.phone = ''
  form.roleIds = []
  form.status = 1
  form.remark = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialog.mode === 'create') {
        await createUser({ ...form })
        ElMessage.success('新增用户成功')
      } else {
        const payload: UserForm = { ...form }
        // 密码统一走「重置密码」入口, 编辑不提交密码
        delete payload.password
        await updateUser(payload)
        ElMessage.success('修改用户成功')
      }
      dialog.visible = false
      await load()
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 启用 / 禁用用户, 失败时回滚开关状态
 *
 * @param row 用户行数据
 */
const handleStatusChange = async (row: UserVO) => {
  try {
    await changeUserStatus(row.id, row.status ?? 0)
    ElMessage.success(row.status === 1 ? '已启用该用户' : '已禁用该用户')
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

/**
 * 重置用户密码
 *
 * @param row 用户行数据
 */
const handleResetPassword = async (row: UserVO) => {
  const input = await ElMessageBox.prompt(`请输入用户「${row.username}」的新密码`, '重置密码', {
    inputType: 'password',
    inputPattern: /^.{6,32}$/,
    inputErrorMessage: '密码长度需为 6-32 位',
    type: 'warning',
  }).catch(() => null)
  if (!input) return
  await resetUserPassword(row.id, input.value)
  ElMessage.success('密码重置成功')
}

/**
 * 删除用户(逻辑删除)
 *
 * @param row 用户行数据
 */
const handleDelete = async (row: UserVO) => {
  await ElMessageBox.confirm(`删除用户「${row.username}」后不可恢复, 确定删除？`, '提示', { type: 'warning' })
  await deleteUser(row.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(async () => {
  await Promise.all([load(), loadRoleOptions()])
})
</script>

<style scoped>
.sub-text {
  font-size: 12px;
  color: #94a3b8;
}
.role-tag {
  margin: 2px;
}
</style>
