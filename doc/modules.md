# 目录与模块说明

本文逐一说明 `src` 下各目录与关键文件的职责、关键入口与使用边界。

## 一、模块一览表

| 模块 | 路径 | 职责一句话 |
|------|------|-----------|
| 应用入口 | `src/main.js` | 挂载应用，注册 Pinia、Router、Element Plus（中文）与全量图标 |
| 根组件 | `src/App.vue` | 仅承载 `<RouterView />` |
| 路由 | `src/router/index.ts` | history 模式路由表、懒加载、登录与权限守卫、动态路由注册、浏览器标题 |
| 菜单 | `src/router/menu.ts` | 后端菜单转换 `buildMenuFromBackend`、本地兜底 `MENU`、路径匹配 `matchMenu` |
| 组件注册表 | `src/router/components.ts` | 菜单 `component` 标识到页面组件的白名单映射 |
| 权限指令 | `src/directives/perm.ts` | 按钮级权限 `v-perm` |
| 状态 | `src/stores/user.ts` | 登录态：令牌、用户信息、角色、权限码、菜单树、登录 / 退出 / 刷新资料 |
| 布局 | `src/layouts/AdminLayout.vue` | 后台框架：可折叠侧边栏 + 面包屑 + 刷新 + 用户下拉 |
| 登录页 | `src/views/auth/Login.vue` | 账号密码登录、登录后按 `redirect` 回跳 |
| 工作台 | `src/views/dashboard/Dashboard.vue` | 概览统计、快捷入口、最近登录、系统信息 |
| 用户管理 | `src/views/system/user/UserList.vue` | 用户分页、增删改、重置密码、启停 |
| 租户管理 | `src/views/system/tenant/TenantList.vue` | 租户分页、增删改、套餐 / 配额、启停 |
| 登录日志 | `src/views/system/log/LoginLogList.vue` | 登录审计流水查询 |
| 角色管理 | `src/views/system/role/RoleList.vue` | 角色分页、增删改、启停、菜单与按钮授权 |
| 菜单管理 | `src/views/system/menu/MenuList.vue` | 目录 / 页面 / 按钮三级菜单树维护 |
| 任务管理页 | `src/views/task/JobList.vue` | 任务分页查询、增删改、暂停 / 恢复 / 执行一次 |
| 任务详情页 | `src/views/task/JobDetail.vue` | 任务明细与参数查看、暂停 / 恢复 / 执行 / 删除 |
| 执行日志页 | `src/views/task/JobLogList.vue` | 状态统计卡片、日志筛选、清理历史 |
| 日志详情页 | `src/views/task/JobLogDetail.vue` | 单次执行明细、任务参数与异常信息 |
| 个人中心 | `src/views/profile/Profile.vue` | 当前账号资料、角色、会话信息、退出登录 |
| 404 | `src/views/error/NotFound.vue` | 未匹配路由兜底页 |
| 接口封装 | `src/api/auth.ts`、`user.ts`、`tenant.ts`、`loginLog.ts`、`task.ts` | 各业务域 REST 调用 |
| 响应模型 | `src/data/result/Result.ts`、`MultiResult.ts` | 对齐后端统一响应，含 `isSuccess` / `isPageResult` |
| 分页工具 | `src/data/page/PageParams.ts` | `buildPageQuery` 展平分页与筛选条件（任务模块 query 查询） |
| 认证模型 | `src/data/auth/*` | `LoginDTO` / `LoginVO` / `UserInfoVO` / `RefreshTokenDTO` |
| 系统模型 | `src/data/system/*` | 用户、租户、登录日志 VO / 查询 / 表单 + `SystemConstants` |
| 任务模型 | `src/data/task/*` | 任务 / 保存参数 / 日志模型 + `TaskConstants` |
| 请求实例 | `src/utils/request.ts` | Axios 实例、令牌注入、统一响应与 401 续期 |
| 凭证工具 | `src/utils/auth.ts` | 令牌 / 刷新令牌 / 用户缓存的本地存储 |
| 日期工具 | `src/utils/date.ts` | 日期 / 耗时格式化 |
| 全局样式 | `src/style.css` | CSS 变量、通用工具类、滚动条 |

---

## 二、各模块详述

### 1. 接口层 `src/api`

集中封装全部后端调用，函数一律返回 `Promise<Result<T>>` 或 `Promise<MultiResult<T>>`，视图层不直接使用 Axios。

- **`auth.ts`**：`login`（登录）、`refreshToken`（刷新令牌）、`logout`（退出）、`fetchCurrentUser`（当前用户）。
- **`user.ts`**：`fetchUserPage`、`fetchUserDetail`、`createUser`、`updateUser`、`deleteUser`、`resetUserPassword`、`changeUserStatus`。
- **`tenant.ts`**：`fetchTenantPage`、`fetchTenantDetail`、`createTenant`、`updateTenant`、`deleteTenant`、`changeTenantStatus`。
- **`loginLog.ts`**：`fetchLoginLogPage`。
- **`task.ts`**：任务与执行日志全部接口（`fetchJobPage`、`pauseJob`、`cleanJobLog` 等）。

> 系统管理接口（user / tenant / loginLog）为 `POST /page` + JSON 请求体筛选；任务接口为 `GET` + URL 查询参数，因此仅任务模块使用 `buildPageQuery`。

### 2. 数据层 `src/data`

- **`result/Result.ts`**：`Result<T>` 通用响应模型，`isSuccess` 判定成功、`isPageResult` 类型守卫。
- **`result/MultiResult.ts`**：`MultiResult<T>` 在 `Result` 基础上扩展 `total` / `page` / `size`。
- **`page/PageParams.ts`**：`PageParams` 接口与 `buildPageQuery`，过滤 `undefined` / `null` / `''` 条件。
- **`auth/`**：登录请求 / 返回、当前用户信息、刷新令牌参数。
- **`system/`**：`UserVO` / `UserQuery` / `UserForm`、`TenantVO` / `TenantQuery` / `TenantForm`、`LoginLogVO` / `LoginLogQuery`。
- **`system/SystemConstants.ts`**：`STATUS_OPTIONS`、`ROLE_OPTIONS`、`PLAN_OPTIONS`、`LOGIN_TYPE_OPTIONS`、`LOGIN_RESULT_OPTIONS` 与 `statusLabel` / `roleLabel` / `planLabel` 等展示工具。
- **`task/`**：`VtJob` / `VtJobSaveDTO` / `VtJobLog` 与 `TaskConstants`。

模型字段与常量含义详见 [数据模型与常量](./data-models.md)。

### 3. 工具层 `src/utils`

- **`request.ts`**：创建 Axios 实例（`baseURL: ''`、超时 `30000ms`）；请求拦截器注入 `Authorization`；响应拦截器统一校验 `Result` / `MultiResult`；401 时通过刷新令牌静默续期（单飞，避免并发重复刷新），失败则清理凭证并跳转登录页；403 单独提示。
- **`auth.ts`**：`getToken` / `setToken` / `getRefreshToken` / `setRefreshToken` / `getCachedUser` / `setCachedUser` / `clearAuth`，统一管理 `localStorage` 键名。
- **`date.ts`**：`formatDateTime`（`YYYY-MM-DD HH:mm:ss`）、`formatDate`（`YYYY-MM-DD`）、`formatDuration`；兼容字符串、时间戳与 Jackson 数组三种时间形态。

### 4. 状态层 `src/stores/user.ts`

Pinia 组合式 store，暴露 `token` / `user` / `roles` / `permissions` / `menus` / `menusReady` / `isLogin` / `isAdmin` / `displayName` / `roleName` / `hasPerm` 与 `login` / `loadUserInfo` / `loadUserMenus` / `useFallbackMenus` / `logout` / `reset`。令牌持久化委托给 `utils/auth`，组件只与 store 交互。

### 5. 入口、根组件与布局

- **`main.js`**：创建应用，全量注册 `@element-plus/icons-vue`，`app.use(createPinia())`、`app.use(router)`、`app.use(ElementPlus, { locale: zhCn })`，最后挂载 `#app`。
- **`App.vue`**：极简根组件，仅 `<RouterView />`。
- **`AdminLayout.vue`**：可折叠深色侧边栏（品牌 + 分组菜单 + 底部技术栈提示）、顶栏（折叠按钮 + 面包屑 + 刷新 + 用户下拉）与主内容区 `<router-view />`；折叠状态持久化到 `localStorage`。

### 6. 视图层 `src/views`

| 页面 | 关键能力 |
|------|----------|
| `auth/Login.vue` | 左品牌右表单的登录布局；表单校验；登录成功按 `redirect` 回跳 |
| `dashboard/Dashboard.vue` | 欢迎卡片、任务 / 日志 / 用户统计卡片、快捷入口、最近登录时间线、系统信息 |
| `system/user/UserList.vue` | 按用户名 / 状态 / 角色筛选；角色标签、状态开关（失败回滚）；新增 / 编辑弹窗（新增密码必填、编辑留空不改）；重置密码；逻辑删除 |
| `system/tenant/TenantList.vue` | 按名称 / 编码 / 套餐 / 状态筛选；套餐标签；配额与到期时间维护；启停开关；删除 |
| `system/log/LoginLogList.vue` | 按登录名 / 结果筛选；结果标签、失败原因、IP、设备、时间展示 |
| `system/role/RoleList.vue` | 按名称 / 编码 / 状态筛选；内置角色保护；菜单树勾选授权（含按钮权限） |
| `system/menu/MenuList.vue` | 目录 / 页面 / 按钮三级树表格；上级菜单选择、组件标识与权限码维护 |
| `task/JobList.vue` | 按名称 / 分组查询；分页表格；新增 / 编辑弹窗（含 JSON 参数录入与校验）；暂停 / 恢复 / 执行一次 / 删除；跳转详情 |
| `task/JobDetail.vue` | 通过 `name` / `group`（query）取详情；`el-descriptions` 展示字段；JSON 参数高亮展示；暂停 / 恢复 / 立即执行 / 删除 / 返回列表 |
| `task/JobLogList.vue` | 四类状态统计卡片；按任务名 / 状态 / 触发时间范围筛选；清理历史日志；跳转日志详情 |
| `task/JobLogDetail.vue` | 通过 `:id`（params）取日志详情；展示时间、耗时、实例、参数、异常信息；返回列表 |
| `profile/Profile.vue` | 头像与角色、账号资料、会话与安全说明、退出登录 |
| `error/NotFound.vue` | 404 兜底，返回工作台 / 上一页 |

### 7. 路由与菜单

- **`router/index.ts`**：history 模式、页面懒加载；`/login` 与 404 独立，其余静态页面嵌套在 `AdminLayout` 下；`beforeEach` 做登录校验、动态路由注册与权限码校验，`afterEach` 同步 `document.title`。
- **`router/menu.ts`**：`buildMenuFromBackend`（后端菜单树 → 侧边栏菜单）、本地兜底 `MENU`、`filterMenu`（按 `isAdmin` 过滤 `adminOnly`）、`matchMenu`（路径 → 菜单项，支持详情页归属）。
- **`router/components.ts`**：菜单 `component` 标识到页面组件懒加载的白名单映射，动态路由只允许注册表内存在的组件。

### 8. 全局样式 `src/style.css`

定义字体与 CSS 变量（`--app-primary`、`--app-primary-dark`、`--app-bg`），以及可复用工具类 `.page-title`、`.page-toolbar`、`.page-card`、`.page-pagination`、主内容区滚动背景与统一滚动条样式。

---

## 三、新增页面的推荐做法

1. 在 `src/views/` 对应业务目录新建页面组件（`<script setup lang="ts">`）。
2. 在 `src/router/components.ts` 注册组件标识（如 `system/xxx/XxxList`），并在 `src/router/index.ts` 中新增静态路由或交由后端菜单动态注册；后端菜单的 `component` 必须与本注册表的键一致。
3. 新增接口权限码（如 `system:xxx:list`）时，在 `t_menu` 中补充按钮/页面节点，并在「角色管理」中授权给对应角色。
4. 按钮级权限使用 `v-perm="'system:xxx:add'"`。
5. 接口调用写入 `src/api/<业务域>.ts`，模型写入 `src/data/<业务域>/`，复用 `request`、`formatDateTime` 等既有工具。
6. 页面容器沿用 `.page-title` + `.page-card` + `.page-toolbar` 约定，保持风格统一。
