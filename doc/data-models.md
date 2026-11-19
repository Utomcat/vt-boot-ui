# 数据模型与常量

本文说明 `vt-boot-ui` 中与后端对齐的 TypeScript 模型、统一响应结构、分页工具与常量映射。所有模型位于 `src/data`，字段命名与后端 VO / DTO / PO 保持一致。

## 一、统一响应模型

### `Result<T>`（`src/data/result/Result.ts`）

```typescript
export interface Result<T = any> {
    code: string      // 状态码: 成功为 "SUCCESS", 失败为业务错误码
    success: boolean  // 是否成功
    msg: string       // 提示信息
    data: T           // 返回数据
}
```

配套判定函数：

| 函数 | 签名 | 说明 |
|------|------|------|
| `isSuccess` | `(result) => boolean` | `success === true` 且 `code` 为 `SUCCESS` / 缺省 |
| `isPageResult` | `(result) => result is MultiResult` | 判断是否为分页结果（含 `total` / `page` / `size` 且 `data` 为数组） |

### `MultiResult<T>`（`src/data/result/MultiResult.ts`）

```typescript
export interface MultiResult<T = any> extends Result<T[]> {
    total: number  // 总记录数
    page: number   // 当前页码
    size: number   // 每页记录数
}
```

## 二、分页参数工具

### `PageParams` 与 `buildPageQuery`（`src/data/page/PageParams.ts`）

```typescript
export interface PageParams {
    page: number | string
    size: number | string
    [key: string]: any
}

export function buildPageQuery(params: {
    page: number | string
    size: number | string
    condition?: Record<string, any>
}): PageParams
```

- 将 `page` / `size` 转为数字，并把 `condition` 的键值展平到同一层。
- 过滤 `undefined` / `null` / `''` 的条件，避免空参数污染请求。
- 用于 **GET + URL 查询参数** 的接口（任务与执行日志）；系统管理接口使用 **POST + JSON body**，直接把查询对象作为请求体发送。

## 三、认证模型（`src/data/auth`）

| 模型 | 对齐后端 | 说明 |
|------|----------|------|
| `LoginDTO` | `LoginPO` | 登录请求：`username` / `password` / `deviceInfo` |
| `LoginVO` | `LoginVO` | 登录返回：`token` / `tokenName` / `refreshToken` / `userId` / `username` / `realName` / `role` / `tenantId` |
| `UserInfoVO` | `UserInfoVO` | 当前用户：`userId` / `username` / `realName` / `role` / `tenantId` / `email` / `phone` / `avatar` |
| `RefreshTokenDTO` | `RefreshTokenPO` | 刷新令牌请求：`refreshToken` |

## 四、系统管理模型（`src/data/system`）

### 用户

| 模型 | 对齐后端 | 主要字段 |
|------|----------|----------|
| `UserVO` | `UserVO` | `id` / `tenantId` / `username` / `realName` / `email` / `phone` / `avatar` / `role` / `status` / `lastLoginTime` / `lastLoginIp` / `createTime` / `remark` |
| `UserQuery` | `UserQueryPO` | `page` / `size` / `username` / `status` / `role` |
| `UserForm` | `UserFormPO` | `id` / `username` / `password` / `realName` / `email` / `phone` / `role` / `status` / `remark` |

### 租户

| 模型 | 对齐后端 | 主要字段 |
|------|----------|----------|
| `TenantVO` | `TenantVO` | `id` / `name` / `code` / `contactName` / `contactEmail` / `plan` / `maxUsers` / `maxStorageMb` / `maxDailyTokens` / `status` / `expireTime` / `createTime` / `remark` |
| `TenantQuery` | `TenantQueryPO` | `page` / `size` / `name` / `code` / `plan` / `status` |
| `TenantForm` | `TenantFormPO` | 同 `TenantVO` 的可编辑字段（`code` 修改时不生效） |

### 登录日志

| 模型 | 对齐后端 | 主要字段 |
|------|----------|----------|
| `LoginLogVO` | `LoginLogVO` | `id` / `userId` / `username` / `loginType` / `success` / `failReason` / `ip` / `deviceInfo` / `createTime` |
| `LoginLogQuery` | `LoginLogQueryPO` | `page` / `size` / `username` / `success` |

### 角色与菜单（`src/data/rbac`）

| 模型 | 对齐后端 | 主要字段 |
|------|----------|----------|
| `RoleVO` | `RoleVO` | `id` / `code` / `name` / `description` / `builtin` / `sort` / `status` / `createTime` / `menuIds`（仅详情） |
| `RoleQuery` | `RoleQueryPO` | `page` / `size` / `name` / `code` / `status` |
| `RoleForm` | `RoleFormPO` | `id` / `code` / `name` / `description` / `sort` / `status` / `menuIds` |
| `MenuVO` | `MenuVO` | `id` / `parentId` / `name` / `type`（`DIR`/`MENU`/`BUTTON`）/ `path` / `component` / `icon` / `permission` / `sort` / `visible` / `status` / `children` |
| `MenuForm` | `MenuFormPO` | 同 `MenuVO` 的可编辑字段 |
| `UserMenuVO` | `UserMenuVO` | `roles` / `permissions` / `menus`（当前登录用户的权限与菜单树） |

约定：

- `permissions` 中若包含 `*`，表示拥有全部权限（超级管理员）。
- 菜单节点 `type = BUTTON` 只提供权限码，不参与路由注册与侧边栏渲染。
- 菜单 `component` 必须与 `src/router/components.ts` 注册表中的键一致，否则不会生成路由。

## 五、任务模型（`src/data/task`）

### `VtJob`（对齐后端 `VtJobVO`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 任务名称 |
| `group` | string | 任务分组 |
| `cron` | string | cron 表达式 |
| `description` | string | 任务描述 |
| `executor` | string | 执行器 Bean 名称 |
| `misfire` | string | 错过触发策略：`FIRE_AND_PROCEED` / `DO_NOTHING` / `IGNORE` |
| `params` | `Record<string, any>` | 任务参数 |
| `tenantId` | string | 租户 ID |
| `paused` | boolean | 是否已暂停 |

### `VtJobSaveDTO`（对齐后端 `VtJobSaveDTO`）

与 `VtJob` 相比无 `paused`（状态由暂停 / 恢复接口控制），且所有字段均为可选。

### `VtJobLog`（对齐后端 `VtJobLogVO`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 主键 |
| `jobName` / `jobGroup` / `triggerName` | string | 任务与触发器标识 |
| `fireTime` / `startTime` / `endTime` | string | 计划 / 开始 / 结束时间 |
| `durationMs` | number | 耗时（毫秒） |
| `status` | number | `0` 执行中 / `1` 成功 / `2` 失败 / `3` 被否决 |
| `params` | string | 任务参数（JSON **字符串**） |
| `errorMsg` | string | 异常信息 |
| `instanceId` / `tenantId` / `createTime` | string | 实例、租户与创建时间 |

> `VtJobLog.params` 是 JSON **字符串**（后端存储形态），详情页会先 `JSON.parse` 再美化展示；解析失败则原样展示。

## 六、常量与枚举映射

### `src/data/task/TaskConstants.ts`

| 常量 / 函数 | 说明 |
|-------------|------|
| `DEFAULT_GROUP` | 默认任务分组 `DEFAULT` |
| `MISFIRE_OPTIONS` | 错过触发策略选项（对齐后端 `MisfirePolicyEnum`） |
| `LOG_STATUS_OPTIONS` | 执行日志状态选项（对齐后端 `JobLogStatusEnum`） |
| `misfireLabel` / `logStatusLabel` / `logStatusTagType` | 展示辅助函数 |

### `src/data/system/SystemConstants.ts`

| 常量 / 函数 | 说明 |
|-------------|------|
| `ROLE_ADMIN` | 管理员角色编码 `ADMIN` |
| `STATUS_OPTIONS` | 启停状态：`1` 正常 / `0` 禁用 |
| `ROLE_OPTIONS` | 角色：`ADMIN` 管理员 / `USER` 普通用户 |
| `PLAN_OPTIONS` | 租户套餐：`FREE` / `STANDARD` / `ENTERPRISE` |
| `LOGIN_TYPE_OPTIONS` | 登录方式：`PASSWORD` / `REFRESH_TOKEN` |
| `LOGIN_RESULT_OPTIONS` | 登录结果：`1` 成功 / `0` 失败 |
| `statusLabel` / `statusTagType` | 状态文案与标签类型 |
| `roleLabel` / `roleTagType` | 角色文案与标签类型 |
| `planLabel` / `planTagType` | 套餐文案与标签类型 |
| `loginTypeLabel` / `loginResultTagType` | 登录方式文案、结果标签类型 |

## 七、与后端对齐说明

| 前端模型 / 常量 | 后端对应 |
|-----------------|----------|
| `Result` / `MultiResult` | `vt-boot-web-starter` 的 `Result` / `MultiResult` |
| `LoginDTO` / `LoginVO` / `UserInfoVO` / `RefreshTokenDTO` | `LoginPO` / `LoginVO` / `UserInfoVO` / `RefreshTokenPO` |
| `UserVO` / `UserQuery` / `UserForm` | `UserVO` / `UserQueryPO` / `UserFormPO` |
| `TenantVO` / `TenantQuery` / `TenantForm` | `TenantVO` / `TenantQueryPO` / `TenantFormPO` |
| `LoginLogVO` / `LoginLogQuery` | `LoginLogVO` / `LoginLogQueryPO` |
| `VtJob` / `VtJobSaveDTO` / `VtJobLog` | `VtJobVO` / `VtJobSaveDTO` / `VtJobLogVO` |
| `MISFIRE_OPTIONS` / `LOG_STATUS_OPTIONS` | `MisfirePolicyEnum` / `JobLogStatusEnum` |
| `ROLE_OPTIONS` / `PLAN_OPTIONS` / `STATUS_OPTIONS` | 用户角色、租户套餐与启停状态约定 |

字段或枚举调整时，需同步修改 `src/data` 对应文件与相关页面展示，避免前后端不一致。
