<template>
  <div>
    <div class="page-title">日志详情</div>
    <el-card shadow="hover" class="page-card" v-loading="loading">
      <template #header>
        <div class="detail-header">
          <span class="detail-name">执行日志 #{{ logId }}</span>
          <el-tag v-if="log" :type="logStatusTagType(log.status)" size="small">
            {{ logStatusLabel(log.status) }}
          </el-tag>
          <div class="detail-actions">
            <el-button icon="Back" @click="goBack">返回列表</el-button>
          </div>
        </div>
      </template>

      <el-descriptions v-if="log" :column="2" border>
        <el-descriptions-item label="主键">{{ log.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ log.jobName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="任务分组">{{ log.jobGroup || '-' }}</el-descriptions-item>
        <el-descriptions-item label="触发器">{{ log.triggerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="计划触发时间">{{ formatDateTime(log.fireTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="实际开始时间">{{ formatDateTime(log.startTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatDateTime(log.endTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ formatDuration(log.durationMs) }}</el-descriptions-item>
        <el-descriptions-item label="执行实例">{{ log.instanceId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="租户 ID">{{ log.tenantId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatDateTime(log.createTime) || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="code-block">
        <div class="code-title">任务参数</div>
        <pre class="code-pre">{{ prettyParams }}</pre>
      </div>

      <div v-if="log?.errorMsg" class="code-block">
        <div class="code-title is-error">异常信息</div>
        <pre class="code-pre is-error">{{ log.errorMsg }}</pre>
      </div>

      <el-empty v-if="!loading && !log" description="未找到该执行日志" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchJobLogDetail } from '../../api/task'
import { VtJobLog } from '../../data/task/VtJobLog'
import { logStatusLabel, logStatusTagType } from '../../data/task/TaskConstants'
import { formatDateTime, formatDuration } from '../../utils/date'

const route = useRoute()
const router = useRouter()

// 加载状态
const loading = ref(false)
// 日志详情数据
const log = ref<VtJobLog | null>(null)
// 日志主键(来自路由参数)
const logId = computed(() => String(route.params.id || ''))

// 任务参数格式化展示(尝试 JSON 美化)
const prettyParams = computed(() => {
    if (!log.value?.params) return '无'
    try {
        return JSON.stringify(JSON.parse(log.value.params), null, 2)
    } catch {
        return log.value.params
    }
})

const load = async () => {
    loading.value = true
    try {
        const res = await fetchJobLogDetail(Number(logId.value))
        log.value = res.data
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.push({ name: 'TaskJobLogList' })
}

onMounted(load)
</script>

<style scoped>
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.detail-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}
.detail-actions {
  margin-left: auto;
}
.code-block {
  margin-top: 20px;
}
.code-title {
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}
.code-title.is-error {
  color: #b91c1c;
}
.code-pre {
  margin: 0;
  padding: 14px 16px;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  overflow: auto;
  max-height: 360px;
  white-space: pre-wrap;
  word-break: break-all;
}
.code-pre.is-error {
  background: #450a0a;
  color: #fecaca;
}
</style>
