# 接口说明

本文描述 `vt-boot-ui` 对接的后端接口，开发环境由 Vite 代理把 `/api/**` 转发到后端（默认 `http://127.0.0.1:9086`），生产环境建议同源反向代理。

接口分三类：

- **认证**：`/api/auth/**`，登录与刷新令牌不需登录，其余需要令牌。
- **系统管理**：`/api/system/**`，全部要求管理员角色。
- **任务调度**：`/api/task/**`，示例工程开放鉴权（生产请按需收紧）。

## 一、统一响应结构

后端统一返回 `Result<T>`，分页接口返回 `MultiResult<T>`，前端在 `src/utils/request.ts` 拦截器中统一校验。

### 单结果 `Result<T>`

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | string | 响应码，成功为 `SUCCESS`，失败为业务错误码 |
| `success` | boolean | 是否成功 |
| `msg` | string | 提示信息 |
| `data` | T | 业务数据 |

```json
{
  "code": "SUCCESS",
  "success": true,
  "msg": "SUCCESS",
  "data": {}
}
```

### 分页 `MultiResult<T>`

在 `Result` 基础上扩展分页字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `data` | array | 列表数据 |
| `total` | number | 总记录数 |
| `page` | number | 当前页码 |
| `size` | number | 每页记录数 |

```json
{
  "code": "SUCCESS",
  "success": true,
  "msg": "SUCCESS",
  "data": [],
  "total": 0,
  "page": 1,
  "size": 10
}
```

> 成功判定：`success === true` 且 `code` 为 `SUCCESS`（或缺省）。未登录返回 HTTP `401`，无权限返回 HTTP `403`。

## 二、认证接口 `/api/auth`

| 方法 | 路径 | 参数位置 | 说明 | 前端函数 |
|------|------|----------|------|----------|
| POST | `/api/auth/login` | body | 账号密码登录 | `login` |
| POST | `/api/auth/refresh` | body | 刷新访问令牌 | `refreshToken` |
| POST | `/api/auth/logout` | — | 退出登录 | `logout` |
| GET | `/api/auth/me` | — | 查询当前登录用户 | `fetchCurrentUser` |

### 登录 `/api/auth/login`

请求体：

```json
{ "username": "admin", "password": "******", "deviceInfo": "Chrome/..." }
```

返回 `Result<LoginVO>`：

| 字段 | 说明 |
|------|------|
| `token` | 访问令牌 |
| `tokenName` | 令牌请求头名称（`Authorization`） |
| `refreshToken` | 刷新令牌（有效期 7 天） |
| `userId` / `username` / `realName` / `role` / `tenantId` | 用户基本信息 |

### 刷新令牌 `/api/auth/refresh`

请求体 `{ "refreshToken": "..." }`，返回与登录相同的 `LoginVO`。

### 当前用户 `/api/auth/me`

无参数，返回 `Result<UserInfoVO>`（含 `email` / `phone` / `avatar`）。

### 当前用户权限与菜单 `/api/auth/menus`

无参数，返回 `Result<UserMenuVO>`：

| 字段 | 说明 |
|------|------|
| `roles` | 角色编码集合，如 `["ADMIN"]` |
| `permissions` | 权限码集合，超级管理员为 `["*"]` |
| `menus` | 可见菜单树（仅目录与页面，不含按钮），节点含 `path` / `component` / `icon` / `permission` |

前端登录后调用一次，用于动态注册路由、渲染侧边栏与按钮级权限（`v-perm`）。

## 三、系统管理接口 `/api/system`

> 全部接口要求登录，并按权限码校验（如 `system:user:list`）。权限不足时后端抛出业务异常，返回 **HTTP 200 + `success=false`**；前端据此提示并跳转 403 页面。

### 用户 `/api/system/user`

| 方法 | 路径 | 参数位置 | 说明 | 前端函数 |
|------|------|----------|------|----------|
| POST | `/api/system/user/page` | body | 分页查询用户 | `fetchUserPage` |
| GET | `/api/system/user/{id}` | path | 查询用户详情 | `fetchUserDetail` |
| POST | `/api/system/user` | body | 新增用户 | `createUser` |
| PUT | `/api/system/user` | body | 修改用户 | `updateUser` |
| DELETE | `/api/system/user/{id}` | path | 逻辑删除用户 | `deleteUser` |
| PUT | `/api/system/user/{id}/password` | query `newPassword` | 重置密码 | `resetUserPassword` |
| PUT | `/api/system/user/{id}/status` | query `status` | 启用(1) / 禁用(0) | `changeUserStatus` |

分页查询请求体：

```json
{ "page": 1, "size": 10, "username": "adm", "status": 1, "role": "ADMIN" }
```

### 租户 `/api/system/tenant`

| 方法 | 路径 | 参数位置 | 说明 | 前端函数 |
|------|------|----------|------|----------|
| POST | `/api/system/tenant/page` | body | 分页查询租户 | `fetchTenantPage` |
| GET | `/api/system/tenant/{id}` | path | 查询租户详情 | `fetchTenantDetail` |
| POST | `/api/system/tenant` | body | 新增租户 | `createTenant` |
| PUT | `/api/system/tenant` | body | 修改租户 | `updateTenant` |
| DELETE | `/api/system/tenant/{id}` | path | 逻辑删除租户 | `deleteTenant` |
| PUT | `/api/system/tenant/{id}/status` | query `status` | 启用(1) / 禁用(0) | `changeTenantStatus` |

分页查询请求体：`{ "page": 1, "size": 10, "name": "", "code": "", "plan": "FREE", "status": 1 }`。

租户表单字段：`name` / `code`（唯一，修改时不生效）/ `contactName` / `contactEmail` / `plan`（`FREE` / `STANDARD` / `ENTERPRISE`）/ `maxUsers` / `maxStorageMb` / `maxDailyTokens` / `status` / `expireTime`（`YYYY-MM-DDTHH:mm:ss`）/ `remark`。

### 登录日志 `/api/system/login-log`

| 方法 | 路径 | 参数位置 | 说明 | 前端函数 |
|------|------|----------|------|----------|
| POST | `/api/system/login-log/page` | body | 分页查询登录日志 | `fetchLoginLogPage` |

分页查询请求体：`{ "page": 1, "size": 10, "username": "adm", "success": 1 }`。

### 角色 `/api/system/role`

| 方法 | 路径 | 参数位置 | 说明 | 权限码 |
|------|------|----------|------|--------|
| POST | `/api/system/role/page` | body | 分页查询角色 | `system:role:list` |
| GET | `/api/system/role/{id}` | path | 角色详情（含 `menuIds`） | `system:role:list` |
| POST | `/api/system/role` | body | 新增角色（可带 `menuIds`） | `system:role:add` |
| PUT | `/api/system/role` | body | 修改角色（可带 `menuIds`） | `system:role:edit` |
| DELETE | `/api/system/role/{id}` | path | 逻辑删除角色 | `system:role:delete` |
| PUT | `/api/system/role/{id}/status` | query `status` | 启用(1) / 禁用(0) | `system:role:edit` |
| PUT | `/api/system/role/{id}/menus` | body `[1,11,111]` | 单独重设菜单授权 | `system:role:assign` |

角色表单字段：`code`（新增必填、租户内唯一、创建后不可修改）/ `name` / `description` / `sort` / `status` / `menuIds`。

约束：内置角色（`builtin = 1`，即 `ADMIN` / `USER`）不可删除、不可停用；存在用户绑定时不允许删除。

### 菜单 `/api/system/menu`

| 方法 | 路径 | 参数位置 | 说明 | 权限码 |
|------|------|----------|------|--------|
| GET | `/api/system/menu/tree` | - | 全部菜单树（含按钮），供菜单管理与角色授权共用 | 仅需登录 |
| POST | `/api/system/menu` | body | 新增菜单 | `system:menu:add` |
| PUT | `/api/system/menu` | body | 修改菜单 | `system:menu:edit` |
| DELETE | `/api/system/menu/{id}` | path | 逻辑删除菜单（存在子节点时拒绝） | `system:menu:delete` |

菜单表单字段：`parentId`（`0` 表示顶级）/ `name` / `type`（`DIR` / `MENU` / `BUTTON`）/ `path`（目录与页面必填）/ `component`（页面必填，需与前端 `router/components.ts` 注册表一致）/ `icon` / `permission` / `sort` / `visible` / `status`。

## 四、任务管理接口 `/api/task`

| 方法 | 路径 | 参数位置 | 说明 | 前端函数 |
|------|------|----------|------|----------|
| GET | `/api/task/list` | query | 分页查询任务 | `fetchJobPage` |
| GET | `/api/task/detail` | query | 查询任务详情 | `fetchJobDetail` |
| POST | `/api/task/create` | body | 新增任务 | `createJob` |
| PUT | `/api/task/update` | body | 修改任务 | `updateJob` |
| PUT | `/api/task/pause` | query | 暂停任务 | `pauseJob` |
| PUT | `/api/task/resume` | query | 恢复任务 | `resumeJob` |
| PUT | `/api/task/trigger` | query | 立即执行一次 | `triggerJob` |
| DELETE | `/api/task/delete` | query | 删除任务 | `deleteJob` |

### 分页查询 `/api/task/list`

| 参数 | 必填 | 说明 |
|------|------|------|
| `page` | 是 | 当前页码 |
| `size` | 是 | 每页条数 |
| `name` | 否 | 任务名称，模糊匹配 |
| `group` | 否 | 任务分组，精确匹配 |

返回 `MultiResult<VtJob>`，`data` 为任务列表。前端由 `src/data/page/PageParams.ts` 的 `buildPageQuery` 展平分页与筛选条件。

### 任务详情 `/api/task/detail`

query 传 `group`（可空）与 `name`（必填），返回 `Result<VtJob>`。

### 新增 / 修改 `/api/task/create`、`/api/task/update`

请求体为 `VtJobSaveDTO`：

```json
{
  "name": "demoJob",
  "group": "DEFAULT",
  "cron": "0 0 3 * * ?",
  "executor": "demoJob",
  "misfire": "DO_NOTHING",
  "tenantId": null,
  "description": "示例任务",
  "params": { "key": "value" }
}
```

### 暂停 / 恢复 / 立即执行 / 删除

这四个接口均通过 query 传 `group`（可空）与 `name`（必填），返回 `Result<void>`。

## 五、执行日志接口 `/api/task/log`

| 方法 | 路径 | 参数位置 | 说明 | 前端函数 |
|------|------|----------|------|----------|
| GET | `/api/task/log/list` | query | 分页查询执行日志 | `fetchJobLogPage` |
| GET | `/api/task/log/detail/{id}` | path | 查询日志详情 | `fetchJobLogDetail` |
| GET | `/api/task/log/summary` | — | 按状态统计日志数量 | `fetchJobLogSummary` |
| DELETE | `/api/task/log/clean` | query | 按保留天数清理历史日志 | `cleanJobLog` |

日志分页参数：`page` / `size`，可选 `jobName`、`status`（`0` 执行中 / `1` 成功 / `2` 失败 / `3` 被否决）、`from` / `to`（`YYYY-MM-DD HH:mm:ss`）。

状态统计返回 `Result<Record<string, number>>`：

```json
{ "running": 2, "success": 120, "failed": 5, "vetoed": 1 }
```

清理历史：query 传 `days`（不传默认 `30`），返回 `Result<number>`（删除条数）。

## 六、前端封装对照

```typescript
// 认证 src/api/auth.ts
export function login(data: LoginDTO): Promise<Result<LoginVO>>
export function refreshToken(data: RefreshTokenDTO): Promise<Result<LoginVO>>
export function logout(): Promise<Result<void>>
export function fetchCurrentUser(): Promise<Result<UserInfoVO>>

// 用户 src/api/user.ts
export function fetchUserPage(query: UserQuery): Promise<MultiResult<UserVO>>
export function fetchUserDetail(id: number): Promise<Result<UserVO>>
export function createUser(data: UserForm): Promise<Result<number>>
export function updateUser(data: UserForm): Promise<Result<void>>
export function deleteUser(id: number): Promise<Result<void>>
export function resetUserPassword(id: number, newPassword: string): Promise<Result<void>>
export function changeUserStatus(id: number, status: number): Promise<Result<void>>

// 租户 src/api/tenant.ts
export function fetchTenantPage(query: TenantQuery): Promise<MultiResult<TenantVO>>
export function fetchTenantDetail(id: number): Promise<Result<TenantVO>>
export function createTenant(data: TenantForm): Promise<Result<number>>
export function updateTenant(data: TenantForm): Promise<Result<void>>
export function deleteTenant(id: number): Promise<Result<void>>
export function changeTenantStatus(id: number, status: number): Promise<Result<void>>

// 登录日志 src/api/loginLog.ts
export function fetchLoginLogPage(query: LoginLogQuery): Promise<MultiResult<LoginLogVO>>

// 任务 src/api/task.ts（略，见上文表格）
```

## 七、错误处理约定

- **业务失败**：后端返回 `success=false`，拦截器取 `msg` 通过 `ElMessage.error` 提示并 `reject`。
- **401 未登录 / 令牌过期**：自动用刷新令牌调用 `/api/auth/refresh` 续期并重放原请求；续期失败则清理凭证并跳转 `/login?redirect=原路径`。并发 401 只发起一次续期。
- **403 无权限**：提示响应中的 `msg`（或「无权限访问该资源」）。
- **网络错误**：优先展示 `err.response.data.msg`，其次 `err.message`，兜底「网络错误」。
- **请求超时**：默认 `30000ms`，超时单独提示「请求超时, 请稍后重试或检查后端服务是否正常运行」。
- 调用方使用 `try / finally` 收尾加载态（`loading`），并可按需 `catch` 处理。
