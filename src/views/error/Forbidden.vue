<template>
  <div class="forbidden">
    <div class="code">403</div>
    <div class="title">没有访问权限</div>
    <div class="desc">当前账号不具备访问该页面的权限，如需访问请联系管理员分配对应角色或权限。</div>
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
.forbidden {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
}
.code {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}
.desc {
  max-width: 460px;
  font-size: 0.88rem;
  line-height: 1.7;
  color: #64748b;
}
.actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
