# 配置说明

本文说明 `vt-boot-ui` 的配置文件构成，以及各文件中的关键可配置项。

## 一、配置文件一览

| 文件 | 职责 |
|------|------|
| `package.json` | 项目元信息、依赖版本与 npm 脚本（`dev` / `build` / `preview`） |
| `vite.config.js` | Vite 构建与开发服务器配置：端口、`/api` 代理、gzip 压缩、手动分包 |
| `tsconfig.json` | 应用侧 TypeScript 编译选项 |
| `tsconfig.node.json` | Node 侧（供 `vite.config` 使用）TS 编译选项 |
| `.npmrc` | npm 镜像源与 SSL 配置 |
| `index.html` | HTML 模板（标题、图标、挂载点 `#app`） |
| `.gitignore` | 忽略 `node_modules`、`dist`、编辑器文件等 |

## 二、vite.config.js（核心配置）

```js
// 后端示例服务默认端口为 9086
const backend = 'http://127.0.0.1:9086'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      verbose: false,   // 不输出每个文件的压缩日志
      disable: false,   // 启用插件
      threshold: 10240, // 只压缩大于 10KB 的文件（字节）
      algorithm: 'gzip',// gzip 算法
      ext: '.gz',       // 生成 .gz 文件
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
```

关键配置项：

| 配置 | 值 | 说明 |
|------|----|------|
| `backend` | `http://127.0.0.1:9086` | 后端地址常量，代理与联调指向目标 |
| `server.port` | `5180` | 开发服务器端口，被占用时修改此处 |
| `server.proxy['/api']` | `{ target: backend, changeOrigin: true }` | 把 `/api` 请求转发到后端，规避开发期跨域 |
| `viteCompression.threshold` | `10240` | 仅压缩大于 10KB 的产物 |
| `viteCompression.algorithm` / `ext` | `gzip` / `.gz` | gzip 压缩并生成 `.gz` 文件 |
| `build.chunkSizeWarningLimit` | `1500` | 单 chunk 体积告警阈值（KB） |
| `manualChunks` | 见上 | 拆分为 `vue-vendor` / `element-plus` / `utils` 三包 |
| `optimizeDeps.include` | 5 个核心依赖 | 预构建，提升冷启动速度 |

> 修改后端地址只改 `backend` 常量；修改开发端口只改 `server.port`，改完重启 `npm run dev`。

## 三、npm 脚本

| 脚本 | 命令 | 说明 |
|------|------|------|
| `dev` | `vite` | 启动开发服务器（默认 `http://localhost:5180`） |
| `build` | `vite build` | 生产构建，产物输出到 `dist/` |
| `preview` | `vite preview` | 本地预览构建产物 |

## 四、TypeScript 配置

`tsconfig.json`（应用侧）要点：

| 选项 | 值 | 说明 |
|------|----|------|
| `target` | `ES2020` | 编译目标 |
| `module` / `moduleResolution` | `ESNext` / `bundler` | 面向打包器的模块解析 |
| `lib` | `ES2020` / `DOM` / `DOM.Iterable` | 浏览器环境类型 |
| `strict` | `true` | 开启严格模式 |
| `noUnusedLocals` / `noUnusedParameters` | `true` | 禁止未使用的局部变量 / 参数 |
| `noFallthroughCasesInSwitch` | `true` | 禁止 `switch` 穿透 |
| `allowImportingTsExtensions` | `true` | 允许显式 `import '...ts'`（配合 `noEmit`） |
| `noEmit` | `true` | 仅类型检查，产物交给 Vite |
| `include` | `src/**/*.ts`、`*.tsx`、`*.vue` | 纳入检查的源码范围 |

`tsconfig.node.json`（Node 侧）用于 `vite.config` 的类型支持，`composite: true`，`include` 指向 `vite.config.ts`。

## 五、npm 镜像（.npmrc）

```ini
strict-ssl=false
registry=https://registry.npmmirror.com
```

国内网络下可显著加速依赖安装；如需切换官方源，可临时改用 `npm install --registry=https://registry.npmjs.org`。

## 六、品牌名称与页面标题

品牌名称统一由 `.env` 中的 `VITE_APP_*` 变量配置（读取入口为 `src/config/app.ts`），所有展示品牌的位置都会读取该配置，改一处即可全局生效：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_APP_NAME` | `VT-Boot` | 品牌短名，用于侧边栏、登录页 Logo、登录页介绍文案 |
| `VITE_APP_SUBTITLE` | `后台管理系统` | 品牌副标题，用于侧边栏、登录页副标题 |
| `VITE_APP_TITLE` | `VT-Boot 后台管理系统` | 完整标题，用于浏览器标签标题与工作台欢迎语；留空时自动使用「名称 + 副标题」组合 |

- 浏览器初始标题：`index.html` 的 `<title>` 使用 `%VITE_APP_TITLE%`，由 Vite 在构建时注入；运行期由 `main.js` 与路由 `afterEach` 按页面覆盖。
- 站点图标为 `public/favicon.svg`，通过 `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` 引用。

## 七、部署建议

- `npm run build` 产物位于 `dist/`，可交给 Nginx 或任意静态服务器托管。
- 建议 **同源部署**：生产环境由网关或 Nginx 把 `/api` 反向代理到后端服务，前端无需再配置跨域，`request` 的 `baseURL` 保持为空即可。
- 大于 10KB 的产物会附带 `.gz` 文件，Nginx 开启 `gzip_static` 可直接复用预压缩产物。
