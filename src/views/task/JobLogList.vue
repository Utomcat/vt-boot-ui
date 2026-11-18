<template>
  <div>
    <div class="page-title">执行日志</div>

    <el-row :gutter="16" class="summary-row">
      <el-col v-for="card in summaryCards" :key="card.key" :xs="12" :sm="6">
        <el-card shadow="hover" class="summary-card" :class="`is-${card.tag}`">
          <div class="summary-label">{{ card.label }}</div>
          <div class="summary-value">{{ summary[card.key] ?? 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <span class="toolbar-label">任务名称：</span>
        <el-input
          v-model="query.jobName"
          placeholder="按任务名称筛选"
          clearable
          style="width: 180px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">状态：</span>
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="item in LOG_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <span class="toolbar-label">触发时间：</span>
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 360px"
          @change="handleSearch"
        />
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button type="danger" plain icon="Delete" @click="handleClean">清理历史日志</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="jobName" label="任务名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="jobGroup" label="分组" width="100" />
        <el-table-column prop="triggerName" label="触发器" min-width="140" show-overflow-tooltip />
        <el-table-column label="计划触发时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.fireTime) }}</template>
        </el-table-column>
        <el-table-column label="实际开始时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="耗时" width="110">
          <template #default="{ row }">{{ formatDuration(row.durationMs) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="logStatusTagType(row.status)" size="small">{{ logStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
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
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cleanJobLog, fetchJobLogPage, fetchJobLogSummary } from '../../api/task'
import { VtJobLog } from '../../data/task/VtJobLog'
import { LOG_STATUS_OPTIONS, logStatusLabel, logStatusTagType } from '../../data/task/TaskConstants'
import { formatDateTime, formatDuration } from '../../utils/date'

const router = useRouter()

// 列表加载状态
const loading = ref(false)
// 日志列表数据
const list = ref<VtJobLog[]>([])
// 数据总数
const total = ref(0)
// 分页参数
const page = reactive({ current: 1, size: 10 })
// 查询条件
const query = reactive<{ jobName: string; status: number | undefined }>({ jobName: '', status: undefined })
// 触发时间范围
const dateRange = ref<[string, string] | null>(null)
// 状态统计
const summary = reactive<Record<string, number>>({ running: 0, success: 0, failed: 0, vetoed: 0 })

// 统计卡片定义
const summaryCards = [
  { key: 'running', label: '执行中', tag: 'warning' },
  { key: 'success', label: '执行成功', tag: 'success' },
  { key: 'failed', label: '执行失败', tag: 'danger' },
  { key: 'vetoed', label: '被否决', tag: 'info' },
]

const loadSummary = async () => {
  const res = await fetchJobLogSummary()
  const data = res.data || {}
  summary.running = Number(data.running) || 0
  summary.success = Number(data.success) || 0
  summary.failed = Number(data.failed) || 0
  summary.vetoed = Number(data.vetoed) || 0
}

const load = async () => {
  loading.value = true
  try {
    const res = await fetchJobLogPage({
      page: page.current,
      size: page.size,
      condition: {
        jobName: query.jobName,
        status: query.status,
        from: dateRange.value?.[0],
        to: dateRange.value?.[1],
      },
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
  query.jobName = ''
  query.status = undefined
  dateRange.value = null
  page.current = 1
  load()
}

const handleSizeChange = () => {
  page.current = 1
  load()
}

const openDetail = (row: VtJobLog) => {
  router.push({ name: 'TaskJobLogDetail', params: { id: String(row.id) } })
}

const handleClean = async () => {
  const input = await ElMessageBox.prompt('请输入保留天数, 早于该天数的日志将被清理', '清理历史日志', {
    inputValue: '30',
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入正整数天数',
    type: 'warning',
  }).catch(() => null)
  if (!input) return
  const res = await cleanJobLog(Number(input.value))
  ElMessage.success(`清理完成, 共删除 ${res.data ?? 0} 条日志`)
  await Promise.all([load(), loadSummary()])
}

onMounted(() => {
  load()
  loadSummary()
})
</script>

<style scoped>
.summary-row {
  margin-bottom: 16px;
}
.summary-card {
  border-radius: 14px;
  border: none;
}
.summary-label {
  font-size: 13px;
  color: #64748b;
}
.summary-value {
  font-size: 26px;
  font-weight: 800;
  margin-top: 6px;
  color: #1e293b;
}
.is-warning .summary-value {
  color: #d97706;
}
.is-success .summary-value {
  color: #16a34a;
}
.is-danger .summary-value {
  color: #dc2626;
}
.is-info .summary-value {
  color: #64748b;
}
</style>
