<template>
  <div>
    <div class="page-title">字典数据</div>
    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <el-button icon="ArrowLeft" @click="goBack">返回</el-button>
        <span class="toolbar-label">字典类型：</span>
        <el-select
          v-model="currentType"
          filterable
          placeholder="请选择字典类型"
          style="width: 240px"
          @change="handleTypeChange"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.dictType"
            :label="`${item.dictName} (${item.dictType})`"
            :value="item.dictType"
          />
        </el-select>
        <span class="toolbar-label">字典标签：</span>
        <el-input
          v-model="query.dictLabel"
          placeholder="模糊匹配标签"
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
        <el-button v-perm="'system:dict:add'" type="success" icon="Plus" :disabled="!currentType" @click="openCreate">
          新增字典数据
        </el-button>
      </div>

      <el-empty v-if="!currentType" description="请先选择字典类型" />

      <template v-else>
        <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
          <el-table-column label="字典标签" min-width="140">
            <template #default="{ row }">
              <el-tag :type="tagTypeOf(row.tagType)" size="small">{{ row.dictLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="dictValue" label="字典键值" min-width="120" show-overflow-tooltip />
          <el-table-column prop="dictSort" label="排序" width="80" align="center" />
          <el-table-column label="默认" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isDefault === 1" type="success" size="small">默认</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
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
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
          <el-table-column label="创建时间" min-width="160">
            <template #default="{ row }">{{ formatDateTime(row.createTime) || '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
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
      </template>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? '新增字典数据' : '编辑字典数据'"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属类型" prop="dictType">
          <el-select v-model="form.dictType" filterable placeholder="请选择字典类型" style="width: 100%">
            <el-option
              v-for="item in typeOptions"
              :key="item.dictType"
              :label="`${item.dictName} (${item.dictType})`"
              :value="item.dictType"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="字典标签" prop="dictLabel">
              <el-input v-model="form.dictLabel" placeholder="如 正常" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典键值" prop="dictValue">
              <el-input v-model="form.dictValue" placeholder="如 1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="dictSort">
              <el-input-number v-model="form.dictSort" :min="0" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签样式" prop="tagType">
              <el-select v-model="form.tagType" placeholder="默认 info" clearable style="width: 100%">
                <el-option v-for="item in TAG_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否默认" prop="isDefault">
              <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可留空" />
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  changeDictDataStatus,
  createDictData,
  deleteDictData,
  fetchDictDataPage,
  fetchDictTypeOptions,
  updateDictData,
} from '../../../api/dict'
import { DictTypeVO } from '../../../data/dict/DictTypeVO'
import { DictDataVO } from '../../../data/dict/DictDataVO'
import { DictDataForm } from '../../../data/dict/DictDataForm'
import { STATUS_OPTIONS } from '../../../data/system/SystemConstants'
import { formatDateTime } from '../../../utils/date'

/**
 * 标签样式选项(Element Plus el-tag 支持的 type)
 */
const TAG_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: '主要(primary)', value: 'primary' },
  { label: '成功(success)', value: 'success' },
  { label: '警告(warning)', value: 'warning' },
  { label: '危险(danger)', value: 'danger' },
  { label: '信息(info)', value: 'info' },
]

const route = useRoute()
const router = useRouter()

// 字典类型下拉选项
const typeOptions = ref<DictTypeVO[]>([])
// 当前选中的字典类型编码
const currentType = ref<string>('')
// 列表加载状态
const loading = ref(false)
// 提交状态
const submitting = ref(false)
// 字典数据列表
const list = ref<DictDataVO[]>([])
// 数据总数
const total = ref(0)
// 分页参数
const page = reactive({ current: 1, size: 10 })
// 查询条件
const query = reactive<{ dictLabel: string; status: number | undefined }>({ dictLabel: '', status: undefined })

// 弹窗状态
const dialog = reactive<{ visible: boolean; mode: 'create' | 'edit' }>({ visible: false, mode: 'create' })
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<DictDataForm>({
  id: undefined,
  dictType: '',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  tagType: 'info',
  cssClass: '',
  isDefault: 0,
  status: 1,
  remark: '',
})

// 表单校验规则
const rules: FormRules = {
  dictType: [{ required: true, message: '请选择所属字典类型', trigger: 'change' }],
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
}

/**
 * 标签样式类型校验, 仅允许 el-tag 支持的取值
 *
 * @param tagType 标签样式
 * @returns Element Plus 标签类型
 */
const tagTypeOf = (tagType?: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const allow = ['primary', 'success', 'warning', 'danger', 'info']
  return (tagType && allow.includes(tagType) ? tagType : 'info') as 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

/**
 * 加载字典类型下拉选项
 */
const loadTypeOptions = async () => {
  const res = await fetchDictTypeOptions()
  typeOptions.value = res.data || []
}

/**
 * 加载字典数据列表
 */
const load = async () => {
  if (!currentType.value) {
    list.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const res = await fetchDictDataPage({
      page: page.current,
      size: page.size,
      dictType: currentType.value,
      dictLabel: query.dictLabel || undefined,
      status: query.status,
    })
    list.value = res.data || []
    total.value = Number(res.total) || 0
  } finally {
    loading.value = false
  }
}

const handleTypeChange = () => {
  page.current = 1
  load()
}

const handleSearch = () => {
  page.current = 1
  load()
}

const handleReset = () => {
  query.dictLabel = ''
  query.status = undefined
  page.current = 1
  load()
}

const handleSizeChange = () => {
  page.current = 1
  load()
}

const goBack = () => {
  // 字典类型列表为后端菜单动态注册的路由(无固定 name), 这里按路径返回, 避免 name 不存在导致跳转无效
  router.push({ path: '/system/dict' })
}

const openCreate = () => {
  dialog.mode = 'create'
  form.dictType = currentType.value
  dialog.visible = true
}

const openEdit = (row: DictDataVO) => {
  dialog.mode = 'edit'
  form.id = row.id
  form.dictType = row.dictType
  form.dictLabel = row.dictLabel
  form.dictValue = row.dictValue
  form.dictSort = row.dictSort ?? 0
  form.tagType = row.tagType || 'info'
  form.cssClass = row.cssClass || ''
  form.isDefault = row.isDefault ?? 0
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  dialog.visible = true
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.id = undefined
  form.dictType = currentType.value
  form.dictLabel = ''
  form.dictValue = ''
  form.dictSort = 0
  form.tagType = 'info'
  form.cssClass = ''
  form.isDefault = 0
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
        await createDictData({ ...form })
        ElMessage.success('新增字典数据成功')
      } else {
        await updateDictData({ ...form })
        ElMessage.success('修改字典数据成功')
      }
      dialog.visible = false
      await load()
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 启用 / 禁用字典数据, 失败时回滚开关状态
 *
 * @param row 字典数据行
 */
const handleStatusChange = async (row: DictDataVO) => {
  try {
    await changeDictDataStatus(row.id, row.status ?? 0)
    ElMessage.success(row.status === 1 ? '已启用' : '已禁用')
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

/**
 * 删除字典数据(逻辑删除)
 *
 * @param row 字典数据行
 */
const handleDelete = async (row: DictDataVO) => {
  await ElMessageBox.confirm(`删除字典数据「${row.dictLabel}」后不可恢复, 确定删除？`, '提示', { type: 'warning' })
  await deleteDictData(row.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(async () => {
  await loadTypeOptions()
  const queryType = (route.query.dictType as string) || ''
  if (queryType) {
    currentType.value = queryType
  } else if (typeOptions.value.length) {
    currentType.value = typeOptions.value[0].dictType
  }
  await load()
})
</script>

<style scoped></style>
