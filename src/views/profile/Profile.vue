<template>
  <div>
    <div class="page-title">个人中心</div>
    <el-row :gutter="16">
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" class="page-card profile-card" v-loading="loading">
          <div class="avatar-wrap">
            <el-avatar :size="76" :src="user?.avatar">
              {{ (user?.realName || user?.username || 'U').slice(0, 1) }}
            </el-avatar>
            <div class="avatar-name">{{ user?.realName || user?.username || '-' }}</div>
            <el-tag :type="userStore.isAdmin ? 'danger' : 'primary'" size="small" effect="dark">
              {{ userStore.roleName }}
            </el-tag>
          </div>
          <el-descriptions :column="1" border class="profile-desc">
            <el-descriptions-item label="登录账号">{{ user?.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="租户名称">{{ user?.tenantName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ user?.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ user?.phone || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="page-card">
          <template #header>
            <div class="card-head">
              <span class="card-title">账号与安全</span>
              <el-button icon="Refresh" @click="load">刷新资料</el-button>
            </div>
          </template>
          <el-alert
            title="账号资料由管理员在「用户管理」中统一维护"
            type="info"
            :closable="false"
            show-icon
            description="如需修改姓名、邮箱、手机号或密码，请联系系统管理员处理。"
          />
          <el-descriptions :column="2" border class="security-desc">
            <el-descriptions-item label="登录状态">
              <el-tag type="success" size="small">已登录</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="认证方式">账号密码 + 刷新令牌</el-descriptions-item>
            <el-descriptions-item label="令牌请求头">Authorization</el-descriptions-item>
            <el-descriptions-item label="会话有效期">30 天(无操作自动续期)</el-descriptions-item>
          </el-descriptions>
          <div class="danger-zone">
            <div>
              <div class="danger-title">退出登录</div>
              <div class="danger-desc">退出后将注销当前会话, 并撤销该账号全部刷新令牌。</div>
            </div>
            <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { UserInfoVO } from '../../data/auth/UserInfoVO'

const router = useRouter()
const userStore = useUserStore()

// 加载状态
const loading = ref(false)
// 当前用户资料
const user = ref<UserInfoVO | null>(userStore.user)

/**
 * 拉取当前登录用户的最新资料
 */
const load = async () => {
  loading.value = true
  try {
    user.value = await userStore.loadUserInfo()
  } finally {
    loading.value = false
  }
}

/**
 * 退出登录并返回登录页
 */
const handleLogout = async () => {
  await ElMessageBox.confirm('确定退出当前账号？', '提示', { type: 'warning' })
  await userStore.logout()
  ElMessage.success('已退出登录')
  await router.replace({ name: 'Login' })
}

onMounted(load)
</script>

<style scoped>
.profile-card {
  text-align: center;
}
.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 0 20px;
}
.avatar-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
}
.profile-desc {
  text-align: left;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-weight: 700;
  color: #1e293b;
}
.security-desc {
  margin-top: 16px;
}
.danger-zone {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.danger-title {
  font-weight: 600;
  color: #b91c1c;
}
.danger-desc {
  margin-top: 4px;
  font-size: 0.78rem;
  color: #ef4444;
}
</style>
