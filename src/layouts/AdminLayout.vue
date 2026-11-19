<template>
  <el-container class="admin-shell">
    <el-aside :width="asideWidth" class="aside">
      <div class="brand" :class="{ 'is-collapsed': collapsed }">
        <span class="dot" />
        <div v-show="!collapsed" class="brand-text">
          <div class="t1">{{ appConfig.name }}</div>
          <div class="t2">{{ appConfig.subtitle }}</div>
        </div>
      </div>

      <el-menu
        :default-active="activePath"
        :collapse="collapsed"
        :collapse-transition="false"
        :unique-opened="true"
        class="menu"
        background-color="#0f172a"
        text-color="#94a3b8"
        active-text-color="#ffffff"
        router
      >
        <template v-for="item in menus" :key="item.path">
          <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
              <el-icon><component :is="child.icon" /></el-icon>
              <template #title>{{ child.title }}</template>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>

      <div v-show="!collapsed" class="aside-foot">
        <span class="foot-tip">Spring Boot 4 · Vue 3 · Sa-Token</span>
      </div>
    </el-aside>

    <el-container class="body">
      <el-header class="header">
        <div class="header-left">
          <el-tooltip :content="collapsed ? '展开菜单' : '收起菜单'" placement="bottom">
            <el-button circle :icon="collapsed ? Expand : Fold" @click="toggleCollapse" />
          </el-tooltip>
          <el-breadcrumb separator="/" class="crumb">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="groupTitle">{{ groupTitle }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title || '工作台' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="刷新当前页" placement="bottom">
            <el-button circle :icon="Refresh" @click="refresh" />
          </el-tooltip>
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-box">
              <el-avatar :size="30" :src="userStore.user?.avatar">{{ initials }}</el-avatar>
              <div class="user-meta">
                <div class="user-name">{{ userStore.displayName }}</div>
                <div class="user-role">{{ userStore.roleName }}</div>
              </div>
              <el-icon class="user-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" icon="Postcard">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" icon="SwitchButton" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Expand, Fold, Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { MENU, filterMenu, matchMenu } from '../router/menu'
import { appConfig } from '../config/app'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态(本地持久化, 刷新后保持)
const COLLAPSE_KEY = 'vt-boot:sidebar-collapsed'
const collapsed = ref(localStorage.getItem(COLLAPSE_KEY) === '1')
watch(collapsed, (value) => {
  localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0')
})

// 侧边栏宽度随折叠状态变化
const asideWidth = computed(() => (collapsed.value ? '64px' : '232px'))

// 侧边栏菜单: 优先使用后端返回的菜单树, 未加载时退化为本地兜底菜单
const menus = computed(() => (userStore.menus.length ? userStore.menus : filterMenu(MENU, userStore.isAdmin)))

// 当前高亮的菜单项(详情页归属到所属列表)
const activePath = computed(() => matchMenu(menus.value, route.path).item?.path || route.path)
// 当前所属一级菜单标题
const groupTitle = computed(() => matchMenu(menus.value, route.path).group?.title)

// 头像兜底文字
const initials = computed(() => (userStore.user?.realName || userStore.user?.username || 'U').slice(0, 1))

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const refresh = () => {
  router.go(0)
}

/**
 * 处理用户下拉菜单命令
 *
 * @param command 命令标识
 */
const handleCommand = async (command: string) => {
  if (command === 'profile') {
    await router.push({ name: 'Profile' })
    return
  }
  if (command === 'logout') {
    const confirmed = await ElMessageBox.confirm('确定退出当前账号？', '提示', { type: 'warning' })
      .then(() => true)
      .catch(() => false)
    if (!confirmed) return
    await userStore.logout()
    ElMessage.success('已退出登录')
    await router.replace({ name: 'Login' })
  }
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
}
.aside {
  background: #0f172a;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  transition: width 0.22s ease;
  overflow: hidden;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 18px;
  color: #fff;
  white-space: nowrap;
}
.brand.is-collapsed {
  justify-content: center;
  padding: 22px 0;
}
.dot {
  flex: none;
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
  overflow-x: hidden;
}
.menu:not(.el-menu--collapse) {
  width: 232px;
}
.menu :deep(.el-menu-item),
.menu :deep(.el-sub-menu__title) {
  border-radius: 10px;
  margin: 4px 10px;
}
.menu :deep(.el-sub-menu .el-menu-item) {
  margin: 2px 10px;
  min-width: auto;
}
.aside-foot {
  padding: 14px 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  white-space: nowrap;
}
.foot-tip {
  font-size: 11px;
  color: #64748b;
}
.body {
  min-width: 0;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
  height: 56px !important;
  padding: 0 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.crumb {
  font-size: 13px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-box {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.user-box:hover {
  background: #f1f5f9;
}
.user-meta {
  line-height: 1.25;
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
.user-role {
  font-size: 11px;
  color: #94a3b8;
}
.user-arrow {
  color: #94a3b8;
  font-size: 12px;
}
@media (max-width: 768px) {
  .user-meta {
    display: none;
  }
}
</style>
