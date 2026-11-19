# 架构设计

本文说明 `vt-boot-ui` 的整体结构、目录分层、认证与请求的数据流、路由与权限机制以及构建分包策略。

## 一、总体结构

`vt-boot-ui` 是 `vt-boot` 项目的后台管理前端，单页应用（SPA），采用 `Vue 3` 组合式 API + `Vite 8` 构建，UI 基于 `Element Plus`：

```text
vt-boot-ui (Vue 3 SPA)
├── index.html                应用入口 HTML（标题：VT-Boot 后台管理系统）
├── src/main.js               应用入口: 注册 Pinia / Router / Element Plus(中文) / 全量图标
├── src/App.vue               根组件（仅 RouterView）
├── src/router/index.ts       路由表（history 模式、懒加载、登录守卫、动态路由注册、权限码守卫）
├── src/router/menu.ts        菜单树转换（后端菜单 / 本地兜底）与路径匹配
├── src/router/components.ts  菜单 component 标识到页面组件的白名单注册表
├── src/directives/perm.ts    按钮级权限指令 v-perm
├── src/stores/user.ts        登录态：令牌、用户信息、角色、权限码、菜单树
├── src/layouts/              布局（AdminLayout：可折叠侧边栏 + 面包屑 + 用户下拉）
├── src/views/                页面：auth / dashboard / system / task / profile / error
├── src/api/                  接口封装：auth / rbac / user / tenant / loginLog / task
├── src/data/                 数据模型（含 rbac）+ 统一响应体 + 分页工具 + 常量
└── src/utils/                请求实例（Axios）+ 凭证存储 + 日期格式化
```

- **视图层**只负责界面与交互，不直接拼接请求细节。
- **接口层**统一封装 REST 调用，**工具层**统一处理响应、凭证与格式化。
- **数据层**声明与后端对齐的 TypeScript 模型、统一响应结构与常量映射。
- 无独立后端、无 Mock，开发期通过 Vite 代理联调真实后端。

## 二、目录分层与职责

| 层 | 目录 | 职责 | 主要产出 |
|----|------|------|----------|
| 入口层 | `src/main.js`、`src/App.vue`、`index.html` | 应用挂载、全局插件注册、根组件 | 应用启动 |
| 路由层 | `src/router` | 路由声明、`meta.title` / `meta.permission`、登录与权限守卫、动态路由注册、菜单树 | `routes`、`registerDynamicRoutes`、`MENU` |
| 状态层 | `src/stores` | 登录态与用户信息、角色、权限码、菜单树 | `useUserStore` |
| 布局层 | `src/layouts` | 后台整体框架（折叠侧边栏、面包屑、用户下拉、刷新） | `AdminLayout.vue` |
| 视图层 | `src/views` | 页面级业务组件 | 登录 / 工作台 / 系统管理 / 任务 / 个人中心 / 404 |
| 接口层 | `src/api` | 封装全部后端接口调用 | `login`、`fetchUserPage` 等函数 |
| 数据层 | `src/data` | 模型、响应体、分页工具、常量枚举 | 类型与工具函数 |
| 工具层 | `src/utils` | Axios 实例与拦截、凭证存储、日期 / 耗时格式化 | `request`、`auth`、`formatDateTime` |
| 样式层 | `src/style.css` | 全局变量与通用工具类 | CSS 变量与工具类 |

**分层约定**：视图 → 接口 → 请求实例 → 后端；视图组件不直接 `import axios`，统一走 `src/api` + `src/utils/request`。

## 三、认证与请求链路

### 3.1 登录流程

```text
/login 表单提交
  → stores/user.login()
  → api/auth.login()           POST /api/auth/login
  → 后端校验账号密码, 建立 Sa-Token 会话
  → 返回 LoginVO(token / refreshToken / userId / role ...)
  → 写入 localStorage(utils/auth) 并更新 Pinia 状态
  → 跳转 redirect 或 /dashboard
```

### 3.2 请求链路与令牌

```text
用户操作（查询 / 提交 / 确认弹窗）
  → views/**/*.vue            组件事件触发
  → src/api/*.ts              调用封装函数（如 fetchUserPage）
  → src/utils/request.ts      请求拦截器注入 Authorization 令牌
  → 后端 /api/**              经 Vite 代理转发到 9086
  → 响应拦截器                校验 Result / MultiResult（isSuccess）
  → 返回 res.data             成功返回响应体，失败 ElMessage 提示并 reject
  → 组件更新数据 / 渲染表格     list、total 等 ref 变化驱动视图
```

要点：

- 令牌请求头名称与后端 `sa-token.token-name` 一致（`Authorization`），值为原始令牌。
- 业务失败：后端返回 `success=false`，拦截器取 `msg` 通过 `ElMessage.error` 提示并 `reject`。
- 401 未登录 / 令牌过期：拦截器用本地 `refreshToken` 调用 `/api/auth/refresh` 静默续期，成功则重放原请求；续期失败则清理凭证并跳转登录页（并发 401 只会触发一次续期）。
- 403 无权限：提示「无权限访问该资源」。

### 3.3 路由守卫

`src/router/index.ts` 的 `beforeEach`：

1. `meta.requiresAuth === false` 的页面（登录、404）直接放行；已登录访问登录页则回工作台。
2. 无令牌 → 跳转 `/login?redirect=原路径`。
3. 有令牌但 Pinia 中没有用户信息 → 调用 `/api/auth/me` 补齐；失败则清理并跳登录页。
4. 首次进入时调用 `/api/auth/menus` 拉取角色、权限码与菜单树，按 `component` 白名单动态注册路由（`registerDynamicRoutes`）；接口异常时退化为本地兜底菜单。
5. `meta.permission` 存在且当前用户不具备该权限码 → 提示并跳转 `/403`。
6. 退出登录或令牌失效时由 `resetDynamicRoutes` 清理动态注册的路由。

## 四、路由与页面

| 页面 | 路由 | 组件 | 来源 |
|------|------|------|------|
| 登录 | `/login` | `views/auth/Login.vue` | 静态路由，`requiresAuth=false` |
| 任务详情 | `/task/job/detail?name=&group=` | `views/task/JobDetail.vue` | 静态路由（不进入菜单） |
| 日志详情 | `/task/log/detail/:id` | `views/task/JobLogDetail.vue` | 静态路由（不进入菜单） |
| 个人中心 | `/profile` | `views/profile/Profile.vue` | 静态路由（不进入菜单） |
| 无权限 | `/403` | `views/error/Forbidden.vue` | 静态路由 |
| 404 | `/:pathMatch(.*)*` | `views/error/NotFound.vue` | 静态路由，`requiresAuth=false` |
| 工作台 | `/dashboard` | `views/dashboard/Dashboard.vue` | 后端菜单动态注册 |
| 用户/租户/登录日志 | `/system/*` | `views/system/**` | 后端菜单动态注册 |
| 角色/菜单管理 | `/system/role`、`/system/menu` | `views/system/role|menu/*` | 后端菜单动态注册 |
| 任务管理/执行日志 | `/task/job`、`/task/log` | `views/task/*` | 后端菜单动态注册 |

- 除登录与 404 外，全部页面嵌套在 `AdminLayout` 下，根路径 `/` 重定向到 `/dashboard`。
- 通过 `declare module 'vue-router'` 扩展 `RouteMeta`：`title`、`requiresAuth`、`permission`。
- 动态路由的 `path` 取自菜单 `path`，`component` 由 `src/router/components.ts` 的注册表映射，`meta.permission` 取自菜单 `permission`。
- 列表页跳详情用 `query`（`name` / `group`），日志详情用 `params`（`id`）。

## 五、布局与导航

`AdminLayout.vue` 承载整个后台框架：

- **侧边栏**：固定深色 `#0f172a`，可折叠（232px ↔ 64px，折叠状态写入 `localStorage`）。
- **菜单**：优先使用 `/api/auth/menus` 返回的菜单树（`buildMenuFromBackend`），后端不可用时退化为 `router/menu.ts` 的本地 `MENU`。
- **按钮权限**：`v-perm="'system:user:add'"` 指令按权限码移除无权按钮。
- **高亮**：`matchMenu` 按路径前缀匹配，详情页仍高亮所属列表。
- **面包屑**：首页 / 一级菜单 / 当前页面标题（取 `route.meta.title`）。
- **右侧**：刷新当前页 + 用户下拉（个人中心、退出登录）。
- **用户下拉退出**：二次确认后调用 `/api/auth/logout`，清理凭证并回到登录页。

## 六、状态管理与 UI

- **全局状态**：`stores/user.ts` 用 Pinia 管理 `token`、`user`、`isLogin`、`isAdmin`、`displayName`；其余页面状态以组件内 `ref` / `reactive` 为主。
- **凭证持久化**：统一由 `utils/auth.ts` 读写 `localStorage`（`vt-boot:token` / `vt-boot:refresh-token` / `vt-boot:user`）。
- **Element Plus**：全量引入并使用中文语言包 `zh-cn`；`@element-plus/icons-vue` 全量注册为全局组件。
- **全局样式**：`src/style.css` 提供 CSS 变量与通用工具类（`.page-title`、`.page-toolbar`、`.page-card`、`.page-pagination`），各页面复用。

## 七、构建与分包

Vite 8 生产构建：

- **gzip 压缩**：`vite-plugin-compression`，仅对大于 `10KB` 的产物生成 `.gz`，算法 `gzip`，扩展名 `.gz`。
- **手动分包**（`build.rollupOptions.output.manualChunks`）：`vue-vendor`（vue / vue-router / pinia）、`element-plus`、`utils`（axios），利于浏览器缓存。
- **体积告警阈值**：`chunkSizeWarningLimit: 1500`（KB）。

具体配置项见 [配置说明](./configuration.md)。

## 八、与后端的关系

- 前端对接 `vt-boot` 提供的三类能力：`/api/auth/**`（认证）、`/api/system/**`（用户 / 租户 / 登录日志，需管理员）、`/api/task/**`（任务调度，示例放开鉴权）。
- 统一响应模型 `Result<T>` / `MultiResult<T>` 与后端 `vt-boot-web-starter` 完全对齐。
- 登录态由 `vt-boot-satoken-starter` 维护，本前端只做令牌携带、续期与失效处理，不自行实现鉴权逻辑。
- 模型字段分别对齐后端 `LoginVO` / `UserInfoVO` / `UserVO` / `TenantVO` / `LoginLogVO` / `VtJobVO` / `VtJobLogVO`，详见 [数据模型与常量](./data-models.md)。
