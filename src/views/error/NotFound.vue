<template>
  <div class="not-found">
    <div class="code">404</div>
    <div class="title">页面不存在</div>
    <div class="desc">你访问的页面已被移除或从未存在，请检查地址是否正确。</div>
    <div class="actions">
      <el-button type="primary" @click="goHome">返回工作台</el-button>
      <el-button @click="goBack">返回上一页</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.replace('/dashboard')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.replace('/dashboard')
  }
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  padding: 24px;
  text-align: center;
}
.code {
  font-size: 5rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}
.desc {
  font-size: 0.88rem;
  color: #64748b;
}
.actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
