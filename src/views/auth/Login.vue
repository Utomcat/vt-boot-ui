<template>
  <div class="login-page">
    <div class="login-bg" />
    <div class="login-wrap">
      <section class="brand-panel">
        <div class="brand-head">
          <span class="logo">VT</span>
          <div>
            <div class="brand-name">{{ appConfig.name }}</div>
            <div class="brand-sub">{{ appConfig.subtitle }}</div>
          </div>
        </div>
        <h1 class="slogan">统一的后台管理入口</h1>
        <p class="desc">
          面向 {{ appConfig.name }} 后端脚手架的一体化控制台，覆盖身份认证、用户与租户管理、登录审计以及定时任务调度。
        </p>
        <ul class="feature-list">
          <li v-for="item in features" :key="item.title">
            <span class="feature-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </span>
            <div>
              <div class="f-title">{{ item.title }}</div>
              <div class="f-desc">{{ item.desc }}</div>
            </div>
          </li>
        </ul>
      </section>

      <section class="form-panel">
        <div class="form-head">
          <h2>账号登录</h2>
          <p>请使用系统分配的账号与密码登录</p>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              clearable
              autocomplete="username"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="请输入密码"
              prefix-icon="Lock"
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-button class="submit" type="primary" size="large" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form>
        <div class="form-foot">
          <span>{{ appConfig.name }} · Spring Boot 4 + Vue 3</span>
          <span>v1.0.0</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { appConfig } from '../../config/app'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 提交状态
const loading = ref(false)
// 表单实例
const formRef = ref<FormInstance>()
// 登录表单
const form = reactive({ username: '', password: '' })

// 表单校验规则
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 左侧能力说明
const features = [
  { icon: 'Key', title: '身份认证', desc: '账号密码登录，访问令牌自动续期与失效重定向' },
  { icon: 'User', title: '系统管理', desc: '用户、租户的统一维护与启停控制' },
  { icon: 'Document', title: '登录审计', desc: '记录登录结果、来源 IP 与失败原因' },
  { icon: 'Timer', title: '任务调度', desc: '定时任务的增删改查与执行日志追踪' },
]

/**
 * 提交登录
 */
const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login({
        username: form.username.trim(),
        password: form.password,
        deviceInfo: navigator.userAgent.slice(0, 200),
      })
      ElMessage.success('登录成功')
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
      await router.replace(redirect.startsWith('/') ? redirect : '/dashboard')
    } catch {
      // 失败提示由请求拦截器统一处理
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background: radial-gradient(circle at 12% 18%, #1e3a8a 0%, #0f172a 42%, #020617 100%);
  overflow: hidden;
}
.login-bg {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 72%);
  pointer-events: none;
}
.login-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 980px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: stretch;
}
.brand-panel {
  color: #e2e8f0;
  padding: 36px 34px;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.brand-head {
  display: flex;
  align-items: center;
  gap: 14px;
}
.logo {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #fff;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.45);
}
.brand-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}
.brand-sub {
  font-size: 0.78rem;
  color: #94a3b8;
}
.slogan {
  margin: 6px 0 0;
  font-size: 1.7rem;
  line-height: 1.3;
  font-weight: 800;
  color: #fff;
}
.desc {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #94a3b8;
}
.feature-list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: grid;
  gap: 14px;
}
.feature-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.feature-icon {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.16);
  border: 1px solid rgba(59, 130, 246, 0.28);
}
.f-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
}
.f-desc {
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.5;
}
.form-panel {
  background: #fff;
  border-radius: 24px;
  padding: 40px 36px;
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.45);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.form-head h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #0f172a;
}
.form-head p {
  margin: 8px 0 26px;
  font-size: 0.85rem;
  color: #64748b;
}
.submit {
  width: 100%;
  margin-top: 6px;
  letter-spacing: 0.3em;
  font-weight: 600;
}
.form-foot {
  margin-top: 26px;
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #94a3b8;
}
@media (max-width: 860px) {
  .login-wrap {
    grid-template-columns: 1fr;
    max-width: 440px;
  }
  .brand-panel {
    display: none;
  }
}
</style>
