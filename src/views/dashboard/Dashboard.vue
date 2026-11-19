<template>
  <div v-loading="loading">
    <div class="page-title">工作台</div>

    <el-card shadow="never" class="welcome-card">
      <div class="welcome-main">
        <div>
          <div class="welcome-title">{{ greeting }}，{{ userStore.displayName }}</div>
          <div class="welcome-sub">
            欢迎使用 {{ appConfig.title }}<template v-if="canVisit('/task/job')">，今天共有 {{ stats.running }} 个任务正在执行</template>。
          </div>
          <div class="welcome-tags">
            <el-tag :type="userStore.isAdmin ? 'danger' : 'primary'" size="small" effect="dark">
              {{ userStore.roleName }}
            </el-tag>
            <el-tag v-if="userStore.user?.tenantName" size="small" effect="plain">
              租户 {{ userStore.user?.tenantName }}
            </el-tag>
            <el-tag size="small" type="info" effect="plain">{{ today }}</el-tag>
          </div>
        </div>
        <div class="welcome-actions">
          <el-button v-if="canVisit('/task/job')" type="primary" plain icon="Timer" @click="go('/task/job')">
            任务管理
          </el-button>
          <el-button v-if="canVisit('/system/user')" icon="User" @click="go('/system/user')">用户管理</el-button>
          <el-button v-if="canVisit('/system/login-log')" icon="Document" @click="go('/system/login-log')">
            登录日志
          </el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.key" :xs="12" :sm="12" :md="statColSpan" :lg="statColSpan">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-head">
            <span class="stat-label">{{ card.label }}</span>
            <span class="stat-icon" :style="{ background: card.bg, color: card.color }">
              <el-icon><component :is="card.icon" /></el-icon>
            </span>
          </div>
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-foot">{{ card.foot }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-row">
      <el-col :xs="24" :lg="canVisit('/system/login-log') ? 15 : 24">
        <el-card shadow="never" class="page-card block-card entry-card">
          <template #header>
            <div class="block-head">
              <div class="block-head-left">
                <span class="block-title">快捷入口</span>
                <span class="block-tip">常用功能一键直达</span>
              </div>
              <el-tag v-if="entries.length" size="small" type="info" effect="plain" round>
                {{ entries.length }} 项
              </el-tag>
            </div>
          </template>
          <div v-if="entries.length" class="entry-grid">
            <div v-for="entry in entries" :key="entry.path" class="entry-item" @click="go(entry.path)">
              <span class="entry-icon">
                <el-icon><component :is="entry.icon" /></el-icon>
              </span>
              <div class="entry-info">
                <div class="entry-title">{{ entry.title }}</div>
                <div class="entry-desc">{{ entry.desc }}</div>
              </div>
              <el-icon class="entry-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-else description="暂无可用的快捷入口" :image-size="60" />
        </el-card>
      </el-col>

      <el-col v-if="canVisit('/system/login-log')" :xs="24" :lg="9">
        <el-card shadow="never" class="page-card block-card">
          <template #header>
            <div class="block-head">
              <span class="block-title">最近登录</span>
              <el-button link type="primary" @click="go('/system/login-log')">查看全部</el-button>
            </div>
          </template>
          <el-timeline v-if="recentLogs.length" class="login-timeline">
            <el-timeline-item
              v-for="log in recentLogs"
              :key="log.id"
              :type="log.success === 1 ? 'success' : 'danger'"
              :timestamp="formatDateTime(log.createTime)"
            >
              <div class="login-line">
                <span class="login-user">{{ log.username || '-' }}</span>
                <el-tag :type="log.success === 1 ? 'success' : 'danger'" size="small" effect="light">
                  {{ log.success === 1 ? '成功' : '失败' }}
                </el-tag>
              </div>
              <div class="login-meta">{{ log.ip || '-' }} · {{ loginTypeLabel(log.loginType) }}</div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无登录记录" :image-size="70" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="page-card block-card">
      <template #header>
        <div class="block-head">
          <span class="block-title">系统信息</span>
          <span class="block-tip">当前会话与运行环境</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="当前账号">{{ userStore.user?.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ userStore.roleName }}</el-descriptions-item>
        <el-descriptions-item label="租户名称">{{ userStore.user?.tenantName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="接口地址">{{ apiBase }}</el-descriptions-item>
        <el-descriptions-item label="前端技术栈">Vue 3 + Vite 8 + Element Plus</el-descriptions-item>
        <el-descriptions-item label="后端技术栈">Spring Boot 4 + Sa-Token + MyBatis-Plus</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'
import { MENU, filterMenu, type MenuItem } from '../../router/menu'
import { appConfig } from '../../config/app'
import { fetchJobPage, fetchJobLogSummary } from '../../api/task'
import { fetchUserPage } from '../../api/user'
import { fetchTenantPage } from '../../api/tenant'
import { fetchLoginLogPage } from '../../api/loginLog'
import { LoginLogVO } from '../../data/system/LoginLogVO'
import { loginTypeLabel } from '../../data/system/SystemConstants'
import { formatDateTime } from '../../utils/date'

const router = useRouter()
const userStore = useUserStore()

// 快捷入口描述文案, 按菜单路径提供友好说明, 未命中时使用默认文案
const ENTRY_DESC: Record<string, string> = {
  '/task/job': '新增、暂停与立即执行定时任务',
  '/task/log': '按状态与时间追踪任务执行情况',
  '/system/user': '维护系统用户、角色与启停状态',
  '/system/tenant': '维护租户套餐、配额与到期时间',
  '/system/role': '维护角色信息与菜单授权范围',
  '/system/menu': '维护菜单结构与权限标识',
  '/system/login-log': '查看账号登录与安全审计记录',
}

// 加载状态
const loading = ref(false)
// 概览统计
const stats = reactive({
  jobTotal: 0,
  success: 0,
  failed: 0,
  running: 0,
  userTotal: 0,
  tenantTotal: 0,
})
// 最近登录记录
const recentLogs = ref<LoginLogVO[]>([])

// 今日日期
const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
// 接口地址(同源部署时为站点根)
const apiBase = `${window.location.origin}/api`

// 问候语(按当前时间段切换)
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 统计卡片定义(按当前用户可访问的功能动态展示)
const statCards = computed(() => {
  const cards: {
    key: string
    label: string
    value: number
    icon: string
    color: string
    bg: string
    foot: string
  }[] = []
  if (canVisit('/task/job')) {
    cards.push({ key: 'jobTotal', label: '任务总数', value: stats.jobTotal, icon: 'Timer', color: '#2563eb', bg: 'rgba(37,99,235,0.12)', foot: '已注册的定时任务' })
  }
  if (canVisit('/task/log')) {
    cards.push({ key: 'success', label: '执行成功', value: stats.success, icon: 'CircleCheck', color: '#16a34a', bg: 'rgba(22,163,74,0.12)', foot: '累计成功执行次数' })
    cards.push({ key: 'failed', label: '执行失败', value: stats.failed, icon: 'CircleClose', color: '#dc2626', bg: 'rgba(220,38,38,0.12)', foot: '累计失败执行次数' })
  }
  if (canVisit('/system/user')) {
    cards.push({ key: 'userTotal', label: '用户总数', value: stats.userTotal, icon: 'User', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', foot: '系统内有效用户数' })
  } else if (canVisit('/task/log')) {
    cards.push({ key: 'running', label: '执行中', value: stats.running, icon: 'Loading', color: '#d97706', bg: 'rgba(217,119,6,0.12)', foot: '当前正在执行的任务' })
  }
  return cards
})

// 统计卡片栅格跨度, 根据卡片数量自适应一行铺满
const statColSpan = computed(() => {
  const count = statCards.value.length
  if (count <= 1) return 24
  if (count === 2) return 12
  if (count === 3) return 8
  return 6
})

/**
 * 递归收集菜单树中的叶子节点(真正可跳转的页面), 目录节点仅用于分组
 *
 * @param nodes 菜单树
 * @returns 可跳转的菜单项列表
 */
function flattenMenu(nodes: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = []
  for (const node of nodes) {
    if (node.children && node.children.length) {
      result.push(...flattenMenu(node.children))
    } else if (node.path) {
      result.push(node)
    }
  }
  return result
}

// 快捷入口(与当前登录用户实际可访问的菜单保持一致, 不显示无权限的功能)
const entries = computed(() => {
  const source = userStore.menus.length ? userStore.menus : filterMenu(MENU, userStore.isAdmin)
  const seen = new Set<string>()
  const list: { path: string; title: string; icon: string; desc: string }[] = []
  for (const item of flattenMenu(source)) {
    // 排除工作台自身与重复项
    if (!item.path || item.path === '/dashboard' || seen.has(item.path)) continue
    seen.add(item.path)
    list.push({
      path: item.path,
      title: item.title,
      icon: item.icon || 'Menu',
      desc: ENTRY_DESC[item.path] || `快速进入${item.title}`,
    })
  }
  // 个人中心为静态路由, 所有登录用户均可访问, 固定追加
  if (!seen.has('/profile')) {
    list.push({ path: '/profile', title: '个人中心', icon: 'Postcard', desc: '查看当前账号资料与角色信息' })
  }
  return list
})

/**
 * 判断当前用户是否可访问指定页面(依据快捷入口是否包含该路径)
 *
 * @param path 目标路径
 * @returns 是否可访问
 */
const canVisit = (path: string): boolean => entries.value.some((entry) => entry.path === path)

/**
 * 跳转到指定页面
 *
 * @param path 目标路径
 */
const go = (path: string) => {
  router.push(path)
}

/**
 * 加载工作台数据, 单个接口失败不影响其它统计项
 */
const load = async () => {
  loading.value = true
  try {
    // 确保菜单已加载, 快捷入口据此只展示当前用户有权限的功能
    if (!userStore.menusReady) {
      try {
        await userStore.loadUserMenus()
      } catch {
        userStore.useFallbackMenus()
      }
    }
    const tasks: Promise<void>[] = [
      userStore.loadUserInfo().then(() => undefined),
      fetchJobPage({ page: 1, size: 1 }).then((res) => {
        stats.jobTotal = Number(res.total) || 0
      }),
      fetchJobLogSummary().then((res) => {
        const data = res.data || {}
        stats.running = Number(data.running) || 0
        stats.success = Number(data.success) || 0
        stats.failed = Number(data.failed) || 0
      }),
    ]
    if (canVisit('/system/user')) {
      tasks.push(
        fetchUserPage({ page: 1, size: 1 }).then((res) => {
          stats.userTotal = Number(res.total) || 0
        }),
      )
    }
    if (canVisit('/system/tenant')) {
      tasks.push(
        fetchTenantPage({ page: 1, size: 1 }).then((res) => {
          stats.tenantTotal = Number(res.total) || 0
        }),
      )
    }
    if (canVisit('/system/login-log')) {
      tasks.push(
        fetchLoginLogPage({ page: 1, size: 6 }).then((res) => {
          recentLogs.value = res.data || []
        }),
      )
    }
    await Promise.allSettled(tasks)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.welcome-card {
  border: none;
  border-radius: 18px;
  background: linear-gradient(120deg, #1d4ed8 0%, #4338ca 55%, #0f172a 100%);
  color: #fff;
  margin-bottom: 16px;
}
.welcome-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.welcome-title {
  font-size: 1.3rem;
  font-weight: 800;
}
.welcome-sub {
  margin-top: 8px;
  font-size: 0.86rem;
  color: rgba(226, 232, 240, 0.85);
}
.welcome-tags {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.welcome-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.stat-row {
  margin-bottom: 16px;
}
.stat-card {
  border: none;
  border-radius: 16px;
}
.stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-label {
  font-size: 0.82rem;
  color: #64748b;
}
.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 17px;
}
.stat-value {
  margin-top: 10px;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}
.stat-foot {
  margin-top: 4px;
  font-size: 0.72rem;
  color: #94a3b8;
}
.block-card {
  margin-bottom: 16px;
}
.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.block-head-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.block-title {
  font-weight: 700;
  color: #1e293b;
}
.block-tip {
  font-size: 0.75rem;
  color: #94a3b8;
}
.main-row {
  align-items: flex-start;
}
/* 快捷入口: 紧凑的等距卡片, 行高随内容自适应, 不再纵向撑高 */
.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}
.entry-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}
.entry-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.12);
}
.entry-icon {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 17px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.12);
  transition: all 0.2s ease;
}
.entry-item:hover .entry-icon {
  color: #fff;
  background: #2563eb;
}
.entry-info {
  min-width: 0;
  flex: 1;
}
.entry-title {
  font-size: 0.86rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}
.entry-desc {
  margin-top: 1px;
  font-size: 0.72rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.entry-arrow {
  margin-left: auto;
  color: #cbd5e1;
  transition: transform 0.2s ease;
}
.entry-item:hover .entry-arrow {
  color: #2563eb;
  transform: translateX(3px);
}
.login-timeline {
  padding-left: 4px;
}
.login-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
.login-user {
  font-weight: 600;
  color: #1e293b;
}
.login-meta {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
