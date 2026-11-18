<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Timer, List, Refresh } from '@element-plus/icons-vue'

const route = useRoute()

// 根据路径前缀计算侧边栏高亮项, 详情页归属到所属列表
const active = computed(() => (route.path.startsWith('/task/log') ? '/task/log' : '/task/job'))
const title = computed(() => route.meta?.title || '任务管理')
</script>

<template>
  <el-container class="admin-shell">
    <el-aside width="232px" class="aside">
      <div class="brand">
        <span class="dot" />
        <div>
          <div class="t1">VT-Boot</div>
          <div class="t2">任务调度控制台</div>
        </div>
      </div>
      <el-menu
        :default-active="active"
        :unique-opened="true"
        class="menu"
        background-color="#0f172a"
        text-color="#94a3b8"
        active-text-color="#fff"
        router
      >
        <el-menu-item index="/task/job">
          <el-icon><Timer /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        <el-menu-item index="/task/log">
          <el-icon><List /></el-icon>
          <span>执行日志</span>
        </el-menu-item>
      </el-menu>
      <div class="aside-foot">
        <span class="foot-tip">定时任务内核 · Quartz 风格调度</span>
      </div>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="crumb">{{ title }}</div>
        <div class="header-right">
          <el-tooltip content="刷新当前页" placement="bottom">
            <el-button circle :icon="Refresh" @click="$router.go(0)" />
          </el-tooltip>
        </div>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
}
.aside {
  background: #0f172a;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 18px;
  color: #fff;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  box-shadow: 0 0 12px #6366f1;
}
.t1 {
  font-weight: 800;
  font-size: 14px;
}
.t2 {
  font-size: 11px;
  opacity: 0.65;
}
.menu {
  border-right: none;
  flex: 1;
}
.menu :deep(.el-menu-item) {
  border-radius: 10px;
  margin: 4px 10px;
}
.aside-foot {
  padding: 14px 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}
.foot-tip {
  font-size: 11px;
  color: #64748b;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
  height: 56px !important;
}
.crumb {
  font-weight: 600;
  color: #334155;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
