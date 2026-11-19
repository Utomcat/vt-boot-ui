<template>
  <div>
    <div class="page-title">任务详情</div>
    <el-card shadow="hover" class="page-card" v-loading="loading">
      <template #header>
        <div class="detail-header">
          <span class="detail-name">{{ job?.name || '-' }}</span>
          <el-tag v-if="job" :type="job.paused ? 'info' : 'success'" size="small">
            {{ job.paused ? '已暂停' : '运行中' }}
          </el-tag>
          <div class="detail-actions">
            <el-button v-if="job?.paused" type="success" icon="VideoPlay" @click="handleResume">恢复</el-button>
            <el-button v-else type="warning" icon="VideoPause" @click="handlePause">暂停</el-button>
            <el-button type="primary" icon="CaretRight" @click="handleTrigger">立即执行</el-button>
            <el-button type="danger" icon="Delete" @click="handleDelete">删除</el-button>
            <el-button icon="Back" @click="goBack">返回列表</el-button>
          </div>
        </div>
      </template>

      <el-descriptions v-if="job" :column="2" border>
        <el-descriptions-item label="任务名称">{{ job.name }}</el-descriptions-item>
        <el-descriptions-item label="任务分组">{{ job.group || DEFAULT_GROUP }}</el-descriptions-item>
        <el-descriptions-item label="cron 表达式">{{ job.cron || '-' }}</el-descriptions-item>
        <el-descriptions-item label="执行器">{{ job.executor || '-' }}</el-descriptions-item>
        <el-descriptions-item label="错过策略">{{ misfireLabel(job.misfire) }}</el-descriptions-item>
        <el-descriptions-item label="所属租户">
          <el-tag v-if="!job.tenantId" type="info" size="small">全部租户</el-tag>
          <span v-else>{{ tenantName(job.tenantId) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="任务描述" :span="2">{{ job.description || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="params-block">
        <div class="params-title">任务参数</div>
        <pre class="params-code">{{ paramsText }}</pre>
      </div>

      <el-empty v-if="!loading && !job" description="未找到该任务" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteJob, fetchJobDetail, pauseJob, resumeJob, triggerJob } from '../../api/task'
import { VtJob } from '../../data/task/VtJob'
import { DEFAULT_GROUP, misfireLabel } from '../../data/task/TaskConstants'
import { useTenantOptions } from '../../composables/useTenantOptions'

const route = useRoute()
const router = useRouter()

// 租户选项与名称解析
const { ensureLoaded: ensureTenantLoaded, tenantName } = useTenantOptions()

// 加载状态
const loading = ref(false)
// 任务详情数据
const job = ref<VtJob | null>(null)
// 任务名称(来自路由 query)
const jobName = computed(() => String(route.query.name || ''))
// 任务分组(来自路由 query)
const jobGroup = computed(() => {
    const g = route.query.group
    return g === undefined || g === null || g === '' ? undefined : String(g)
})

// 任务参数格式化展示
const paramsText = computed(() => {
    if (!job.value?.params) return '无'
    try {
        return JSON.stringify(job.value.params, null, 2)
    } catch {
        return String(job.value.params)
    }
})

const load = async () => {
    if (!jobName.value) {
        job.value = null
        return
    }
    loading.value = true
    try {
        const res = await fetchJobDetail(jobGroup.value, jobName.value)
        job.value = res.data
    } finally {
        loading.value = false
    }
}

const handlePause = async () => {
    if (!job.value) return
    await ElMessageBox.confirm(`确定暂停任务「${job.value.name}」？`, '提示', { type: 'warning' })
    await pauseJob(job.value.group, job.value.name)
    ElMessage.success('已暂停')
    await load()
}

const handleResume = async () => {
    if (!job.value) return
    await resumeJob(job.value.group, job.value.name)
    ElMessage.success('已恢复')
    await load()
}

const handleTrigger = async () => {
    if (!job.value) return
    await ElMessageBox.confirm(`确定立即执行一次任务「${job.value.name}」？`, '提示', { type: 'warning' })
    await triggerJob(job.value.group, job.value.name)
    ElMessage.success('已触发一次执行')
}

const handleDelete = async () => {
    if (!job.value) return
    await ElMessageBox.confirm(`删除任务「${job.value.name}」后不可恢复, 确定删除？`, '提示', { type: 'warning' })
    await deleteJob(job.value.group, job.value.name)
    ElMessage.success('已删除')
    router.push('/task/job')
}

const goBack = () => {
    router.push('/task/job')
}

onMounted(async () => {
    await Promise.all([load(), ensureTenantLoaded()])
})
</script>

<style scoped>
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.detail-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}
.detail-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.params-block {
  margin-top: 20px;
}
.params-title {
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}
.params-code {
  margin: 0;
  padding: 14px 16px;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  overflow: auto;
  max-height: 320px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
