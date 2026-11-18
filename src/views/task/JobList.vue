<template>
  <div>
    <div class="page-title">任务管理</div>
    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <span class="toolbar-label">任务名称：</span>
        <el-input
          v-model="query.name"
          placeholder="模糊匹配任务名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">任务分组：</span>
        <el-input
          v-model="query.group"
          placeholder="精确匹配分组"
          clearable
          style="width: 180px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="openCreate">新增任务</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="name" label="任务名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="group" label="分组" width="110" />
        <el-table-column prop="cron" label="cron 表达式" min-width="150" show-overflow-tooltip />
        <el-table-column prop="executor" label="执行器" min-width="120" show-overflow-tooltip />
        <el-table-column label="错过策略" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ misfireLabel(row.misfire) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.paused ? 'info' : 'success'" size="small">
              {{ row.paused ? '已暂停' : '运行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.paused" link type="success" @click="handleResume(row)">恢复</el-button>
            <el-button v-else link type="warning" @click="handlePause(row)">暂停</el-button>
            <el-button link type="primary" @click="handleTrigger(row)">执行一次</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
      :title="dialog.mode === 'create' ? '新增任务' : '编辑任务'"
      width="560px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" :disabled="dialog.mode === 'edit'" placeholder="任务唯一标识" />
        </el-form-item>
        <el-form-item label="任务分组" prop="group">
          <el-input v-model="form.group" placeholder="默认 DEFAULT" />
        </el-form-item>
        <el-form-item label="cron 表达式" prop="cron">
          <el-input v-model="form.cron" placeholder="如 0 0 3 * * ?" />
        </el-form-item>
        <el-form-item label="执行器" prop="executor">
          <el-input v-model="form.executor" placeholder="实现 VtJobExecutor 的 Bean 名称, 如 demoJob" />
        </el-form-item>
        <el-form-item label="错过策略" prop="misfire">
          <el-select v-model="form.misfire" placeholder="选择错过触发处理策略" style="width: 100%">
            <el-option
              v-for="item in MISFIRE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="租户 ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="可留空" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="任务说明" />
        </el-form-item>
        <el-form-item label="任务参数" prop="paramsText">
          <el-input
            v-model="form.paramsText"
            type="textarea"
            :rows="4"
            placeholder='JSON 对象, 如 {"key":"value"}, 留空表示无参数'
          />
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
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createJob,
  deleteJob,
  fetchJobPage,
  pauseJob,
  resumeJob,
  triggerJob,
  updateJob,
} from '../../api/task'
import { VtJob } from '../../data/task/VtJob'
import { VtJobSaveDTO } from '../../data/task/VtJobSaveDTO'
import { DEFAULT_GROUP, MISFIRE_OPTIONS, misfireLabel } from '../../data/task/TaskConstants'

const router = useRouter()

// 列表加载状态
const loading = ref(false)
// 提交状态
const submitting = ref(false)
// 任务列表数据
const list = ref<VtJob[]>([])
// 数据总数
const total = ref(0)
// 分页参数
const page = reactive({ current: 1, size: 10 })
// 查询条件
const query = reactive({ name: '', group: '' })

// 弹窗状态
const dialog = reactive<{ visible: boolean; mode: 'create' | 'edit' }>({ visible: false, mode: 'create' })
const formRef = ref<FormInstance>()

// 表单数据(含用于编辑的 params JSON 文本)
const form = reactive({
  name: '',
  group: DEFAULT_GROUP,
  cron: '',
  executor: '',
  misfire: 'DO_NOTHING',
  tenantId: '',
  description: '',
  paramsText: '',
})

// 表单校验规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  cron: [{ required: true, message: '请输入 cron 表达式', trigger: 'blur' }],
  executor: [{ required: true, message: '请输入执行器 Bean 名称', trigger: 'blur' }],
}

const load = async () => {
  loading.value = true
  try {
    const res = await fetchJobPage({
      page: page.current,
      size: page.size,
      condition: { name: query.name, group: query.group },
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
  query.group = ''
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

const openEdit = (row: VtJob) => {
  dialog.mode = 'edit'
  form.name = row.name
  form.group = row.group || DEFAULT_GROUP
  form.cron = row.cron || ''
  form.executor = row.executor || ''
  form.misfire = row.misfire || 'DO_NOTHING'
  form.tenantId = row.tenantId || ''
  form.description = row.description || ''
  form.paramsText = row.params ? JSON.stringify(row.params, null, 2) : ''
  dialog.visible = true
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.name = ''
  form.group = DEFAULT_GROUP
  form.cron = ''
  form.executor = ''
  form.misfire = 'DO_NOTHING'
  form.tenantId = ''
  form.description = ''
  form.paramsText = ''
}

const openDetail = (row: VtJob) => {
  router.push({ name: 'TaskJobDetail', query: { name: row.name, group: row.group } })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    let params: Record<string, any> | undefined
    const text = form.paramsText.trim()
    if (text) {
      try {
        params = JSON.parse(text)
      } catch {
        ElMessage.error('任务参数不是合法的 JSON')
        return
      }
    }
    const payload: VtJobSaveDTO = {
      name: form.name,
      group: form.group || DEFAULT_GROUP,
      cron: form.cron,
      executor: form.executor,
      misfire: form.misfire,
      tenantId: form.tenantId || undefined,
      description: form.description,
      params,
    }
    submitting.value = true
    try {
      if (dialog.mode === 'create') {
        await createJob(payload)
        ElMessage.success('新增任务成功')
      } else {
        await updateJob(payload)
        ElMessage.success('修改任务成功')
      }
      dialog.visible = false
      await load()
    } finally {
      submitting.value = false
    }
  })
}

const handlePause = async (row: VtJob) => {
  await ElMessageBox.confirm(`确定暂停任务「${row.name}」？`, '提示', { type: 'warning' })
  await pauseJob(row.group, row.name)
  ElMessage.success('已暂停')
  await load()
}

const handleResume = async (row: VtJob) => {
  await resumeJob(row.group, row.name)
  ElMessage.success('已恢复')
  await load()
}

const handleTrigger = async (row: VtJob) => {
  await ElMessageBox.confirm(`确定立即执行一次任务「${row.name}」？`, '提示', { type: 'warning' })
  await triggerJob(row.group, row.name)
  ElMessage.success('已触发一次执行')
}

const handleDelete = async (row: VtJob) => {
  await ElMessageBox.confirm(`删除任务「${row.name}」后不可恢复, 确定删除？`, '提示', { type: 'warning' })
  await deleteJob(row.group, row.name)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>
