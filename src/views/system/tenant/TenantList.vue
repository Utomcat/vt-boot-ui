<template>
  <div>
    <div class="page-title">租户管理</div>
    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <span class="toolbar-label">租户名称：</span>
        <el-input
          v-model="query.name"
          placeholder="模糊匹配名称"
          clearable
          style="width: 170px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">租户编码：</span>
        <el-input
          v-model="query.code"
          placeholder="模糊匹配编码"
          clearable
          style="width: 170px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">套餐：</span>
        <el-select v-model="query.plan" placeholder="全部套餐" clearable style="width: 130px" @change="handleSearch">
          <el-option v-for="item in PLAN_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <span class="toolbar-label">状态：</span>
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 120px" @change="handleSearch">
          <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button v-perm="'system:tenant:add'" type="success" icon="Plus" @click="openCreate">新增租户</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="name" label="租户名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="code" label="租户编码" min-width="130" show-overflow-tooltip />
        <el-table-column label="套餐" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="planTagType(row.plan)" size="small">{{ planLabel(row.plan) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactName" label="联系人" min-width="110" show-overflow-tooltip />
        <el-table-column prop="contactEmail" label="联系邮箱" min-width="170" show-overflow-tooltip />
        <el-table-column label="配额" min-width="150">
          <template #default="{ row }">
            <div class="sub-text">用户 {{ row.maxUsers ?? '-' }} 个</div>
            <div class="sub-text">存储 {{ row.maxStorageMb ?? '-' }} MB</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch v-perm="'system:tenant:status'" v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="到期时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.expireTime) || '长期有效' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-perm="'system:tenant:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-perm="'system:tenant:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
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
      :title="dialog.mode === 'create' ? '新增租户' : '编辑租户'"
      width="680px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="租户名称" prop="name">
              <el-input v-model="form.name" placeholder="如 某某科技有限公司" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租户编码" prop="code">
              <el-input v-model="form.code" :disabled="dialog.mode === 'edit'" placeholder="唯一编码, 如 acme" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactName">
              <el-input v-model="form.contactName" placeholder="联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="form.contactEmail" placeholder="example@domain.com" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="套餐" prop="plan">
              <el-select v-model="form.plan" placeholder="选择套餐" style="width: 100%">
                <el-option v-for="item in PLAN_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期时间" prop="expireTime">
              <el-date-picker
                v-model="form.expireTime"
                type="datetime"
                placeholder="留空表示长期有效"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最大用户数" prop="maxUsers">
              <el-input-number v-model="form.maxUsers" :min="0" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="存储(MB)" prop="maxStorageMb">
              <el-input-number v-model="form.maxStorageMb" :min="0" :step="1024" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="每日Token" prop="maxDailyTokens">
              <el-input-number v-model="form.maxDailyTokens" :min="0" :step="1000" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  changeTenantStatus,
  createTenant,
  deleteTenant,
  fetchTenantPage,
  updateTenant,
} from '../../../api/tenant'
import { TenantVO } from '../../../data/system/TenantVO'
import { TenantForm } from '../../../data/system/TenantForm'
import { PLAN_OPTIONS, STATUS_OPTIONS, planLabel, planTagType } from '../../../data/system/SystemConstants'
import { formatDateTime, toDateTimeString } from '../../../utils/date'

// 列表加载状态
const loading = ref(false)
// 提交状态
const submitting = ref(false)
// 租户列表
const list = ref<TenantVO[]>([])
// 数据总数
const total = ref(0)
// 分页参数
const page = reactive({ current: 1, size: 10 })
// 查询条件
const query = reactive<{
  name: string
  code: string
  plan: string | undefined
  status: number | undefined
}>({ name: '', code: '', plan: undefined, status: undefined })

// 弹窗状态
const dialog = reactive<{ visible: boolean; mode: 'create' | 'edit' }>({ visible: false, mode: 'create' })
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<TenantForm>({
  id: undefined,
  name: '',
  code: '',
  contactName: '',
  contactEmail: '',
  plan: 'FREE',
  maxUsers: 10,
  maxStorageMb: 1024,
  maxDailyTokens: 10000,
  status: 1,
  expireTime: undefined,
  remark: '',
})

// 表单校验规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入租户编码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]{2,32}$/, message: '编码为 2-32 位字母、数字、下划线或中划线', trigger: 'blur' },
  ],
  contactEmail: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
}

/**
 * 加载租户列表
 */
const load = async () => {
  loading.value = true
  try {
    const res = await fetchTenantPage({
      page: page.current,
      size: page.size,
      name: query.name || undefined,
      code: query.code || undefined,
      plan: query.plan,
      status: query.status,
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
  query.name = ''
  query.code = ''
  query.plan = undefined
  query.status = undefined
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

const openEdit = (row: TenantVO) => {
  dialog.mode = 'edit'
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.contactName = row.contactName || ''
  form.contactEmail = row.contactEmail || ''
  form.plan = row.plan || 'FREE'
  form.maxUsers = row.maxUsers ?? 0
  form.maxStorageMb = row.maxStorageMb ?? 0
  form.maxDailyTokens = row.maxDailyTokens ?? 0
  form.status = row.status ?? 1
  form.expireTime = toDateTimeString(row.expireTime)
  form.remark = row.remark || ''
  dialog.visible = true
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.id = undefined
  form.name = ''
  form.code = ''
  form.contactName = ''
  form.contactEmail = ''
  form.plan = 'FREE'
  form.maxUsers = 10
  form.maxStorageMb = 1024
  form.maxDailyTokens = 10000
  form.status = 1
  form.expireTime = undefined
  form.remark = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialog.mode === 'create') {
        await createTenant({ ...form })
        ElMessage.success('新增租户成功')
      } else {
        await updateTenant({ ...form })
        ElMessage.success('修改租户成功')
      }
      dialog.visible = false
      await load()
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 启用 / 禁用租户, 失败时回滚开关状态
 *
 * @param row 租户行数据
 */
const handleStatusChange = async (row: TenantVO) => {
  try {
    await changeTenantStatus(row.id, row.status ?? 0)
    ElMessage.success(row.status === 1 ? '已启用该租户' : '已禁用该租户')
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

/**
 * 删除租户(逻辑删除)
 *
 * @param row 租户行数据
 */
const handleDelete = async (row: TenantVO) => {
  await ElMessageBox.confirm(`删除租户「${row.name}」后不可恢复, 确定删除？`, '提示', { type: 'warning' })
  await deleteTenant(row.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>

<style scoped>
.sub-text {
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}
</style>
