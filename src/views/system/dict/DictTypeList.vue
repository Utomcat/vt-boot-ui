<template>
  <div>
    <div class="page-title">字典管理</div>
    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <span class="toolbar-label">字典名称：</span>
        <el-input
          v-model="query.dictName"
          placeholder="模糊匹配名称"
          clearable
          style="width: 170px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">字典类型：</span>
        <el-input
          v-model="query.dictType"
          placeholder="模糊匹配编码"
          clearable
          style="width: 190px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">状态：</span>
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 120px" @change="handleSearch">
          <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button v-perm="'system:dict:add'" type="success" icon="Plus" @click="openCreate">新增字典类型</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="dictName" label="字典名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="dictType" label="字典类型编码" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-perm="'system:dict:status'"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openData(row)">字典数据</el-button>
            <el-button v-perm="'system:dict:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-perm="'system:dict:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
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
      :title="dialog.mode === 'create' ? '新增字典类型' : '编辑字典类型'"
      width="560px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="如 用户状态" />
        </el-form-item>
        <el-form-item label="字典类型编码" prop="dictType">
          <el-input v-model="form.dictType" placeholder="如 sys_user_status" />
          <div class="form-tip">业务通过该编码读取字典, 修改后会自动同步其下字典数据。</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可留空" />
        </el-form-item>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  changeDictTypeStatus,
  createDictType,
  deleteDictType,
  fetchDictTypePage,
  updateDictType,
} from '../../../api/dict'
import { DictTypeVO } from '../../../data/dict/DictTypeVO'
import { DictTypeForm } from '../../../data/dict/DictTypeForm'
import { STATUS_OPTIONS } from '../../../data/system/SystemConstants'
import { formatDateTime } from '../../../utils/date'

const router = useRouter()

// 列表加载状态
const loading = ref(false)
// 提交状态
const submitting = ref(false)
// 字典类型列表
const list = ref<DictTypeVO[]>([])
// 数据总数
const total = ref(0)
// 分页参数
const page = reactive({ current: 1, size: 10 })
// 查询条件
const query = reactive<{ dictName: string; dictType: string; status: number | undefined }>({
  dictName: '',
  dictType: '',
  status: undefined,
})

// 弹窗状态
const dialog = reactive<{ visible: boolean; mode: 'create' | 'edit' }>({ visible: false, mode: 'create' })
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<DictTypeForm>({
  id: undefined,
  dictName: '',
  dictType: '',
  status: 1,
  remark: '',
})

// 表单校验规则
const rules: FormRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [
    { required: true, message: '请输入字典类型编码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]{2,128}$/, message: '编码为 2-128 位字母、数字、下划线或中划线', trigger: 'blur' },
  ],
}

/**
 * 加载字典类型列表
 */
const load = async () => {
  loading.value = true
  try {
    const res = await fetchDictTypePage({
      page: page.current,
      size: page.size,
      dictName: query.dictName || undefined,
      dictType: query.dictType || undefined,
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
  query.dictName = ''
  query.dictType = ''
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

const openEdit = (row: DictTypeVO) => {
  dialog.mode = 'edit'
  form.id = row.id
  form.dictName = row.dictName
  form.dictType = row.dictType
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  dialog.visible = true
}

/**
 * 跳转到该字典类型下的字典数据页面
 *
 * @param row 字典类型行数据
 */
const openData = (row: DictTypeVO) => {
  router.push({ name: 'SystemDictData', query: { dictType: row.dictType, dictName: row.dictName } })
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.id = undefined
  form.dictName = ''
  form.dictType = ''
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
        await createDictType({ ...form })
        ElMessage.success('新增字典类型成功')
      } else {
        await updateDictType({ ...form })
        ElMessage.success('修改字典类型成功')
      }
      dialog.visible = false
      await load()
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 启用 / 禁用字典类型, 失败时回滚开关状态
 *
 * @param row 字典类型行数据
 */
const handleStatusChange = async (row: DictTypeVO) => {
  try {
    await changeDictTypeStatus(row.id, row.status ?? 0)
    ElMessage.success(row.status === 1 ? '已启用' : '已禁用')
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

/**
 * 删除字典类型(逻辑删除)
 *
 * @param row 字典类型行数据
 */
const handleDelete = async (row: DictTypeVO) => {
  await ElMessageBox.confirm(`删除字典类型「${row.dictName}」后不可恢复, 确定删除？`, '提示', { type: 'warning' })
  await deleteDictType(row.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
  margin-top: 4px;
}
</style>
