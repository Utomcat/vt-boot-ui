<template>
  <div>
    <div class="page-title">登录日志</div>
    <el-card shadow="hover" class="page-card">
      <div class="page-toolbar">
        <span class="toolbar-label">登录名：</span>
        <el-input
          v-model="query.username"
          placeholder="模糊匹配登录名"
          clearable
          style="width: 190px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <span class="toolbar-label">登录结果：</span>
        <el-select v-model="query.success" placeholder="全部结果" clearable style="width: 130px" @change="handleSearch">
          <el-option
            v-for="item in LOGIN_RESULT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="username" label="登录名" min-width="130" show-overflow-tooltip />
        <el-table-column label="登录方式" width="120" align="center">
          <template #default="{ row }">{{ loginTypeLabel(row.loginType) }}</template>
        </el-table-column>
        <el-table-column label="结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="loginResultTagType(row.success)" size="small">
              {{ row.success === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="failReason" label="失败原因" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.failReason || '-' }}</template>
        </el-table-column>
        <el-table-column prop="ip" label="客户端 IP" min-width="140" show-overflow-tooltip />
        <el-table-column prop="deviceInfo" label="设备信息" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.deviceInfo || '-' }}</template>
        </el-table-column>
        <el-table-column label="登录时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.createTime) || '-' }}</template>
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
import { fetchLoginLogPage } from '../../../api/loginLog'
import { LoginLogVO } from '../../../data/system/LoginLogVO'
import { LOGIN_RESULT_OPTIONS, loginResultTagType, loginTypeLabel } from '../../../data/system/SystemConstants'
import { formatDateTime } from '../../../utils/date'

// 列表加载状态
const loading = ref(false)
// 登录日志列表
const list = ref<LoginLogVO[]>([])
// 数据总数
const total = ref(0)
// 分页参数
const page = reactive({ current: 1, size: 10 })
// 查询条件
const query = reactive<{ username: string; success: number | undefined }>({ username: '', success: undefined })

/**
 * 加载登录日志列表
 */
const load = async () => {
  loading.value = true
  try {
    const res = await fetchLoginLogPage({
      page: page.current,
      size: page.size,
      username: query.username || undefined,
      success: query.success,
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
  query.success = undefined
  page.current = 1
  load()
}

const handleSizeChange = () => {
  page.current = 1
  load()
}

onMounted(load)
</script>
