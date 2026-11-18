import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'

// 后端示例服务默认端口为 9086，任务管理接口前缀为 /api/task
const backend = 'http://127.0.0.1:9086'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      // 不显示每个文件的压缩日志
      verbose: false,
      // 启用插件
      disable: false,
      // 只压缩大于 10KB 的文件（单位：字节）
      threshold: 10240,
      // 使用 gzip 算法
      algorithm: 'gzip',
      // 生成 .gz 文件
      ext: '.gz',
    }),
  ],
  server: {
    port: 5180,
    proxy: {
      '/api': { target: backend, changeOrigin: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'element-plus'
            }
            if (id.includes('axios')) {
              return 'utils'
            }
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios'],
  },
})
