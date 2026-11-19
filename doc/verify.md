# 联调验收清单

本文用于 `vt-boot-ui` 与 `vt-boot-example-admin` 的端到端联调验收，覆盖认证、RBAC 动态菜单、四个系统管理页面与任务调度页面。

## 一、环境前置

| 项 | 要求 |
|----|------|
| 后端 | `vt-boot-example-admin` 已启动，端口 `9086`，数据库可连通 |
| 数据库 | 已执行 `vt-boot-example-admin/src/main/resources/db/rbac-mysql.sql`（幂等） |
| 前端 | `npm install` 后 `npm run dev`，默认 `http://localhost:5180`，`/api` 代理到 `http://127.0.0.1:9086` |
| 账号 | `admin` / `Vt@123456`（管理员）；`tester` 为普通用户账号 |

> `admin` 密码在初始化时被重置为 MD5 兼容密文（`Vt@123456`）。登录成功后建议在「用户管理 → 重置密码」中改为 BCrypt 强密码。
> 如需验证普通用户视角，可用同样的方式重置 `tester` 密码：
> `update t_user set password='138c58acb89fb54a9d3108820698f8b7' where username='tester';`

## 二、接口自检（可选，先用命令确认后端可用）

```powershell
# 1. 登录, 记录返回的 token
$login = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:9086/api/auth/login' `
  -ContentType 'application/json' -Body '{"username":"admin","password":"Vt@123456"}'
$login | ConvertTo-Json -Depth 5
$token = $login.data.token

# 2. 当前用户权限与菜单
Invoke-RestMethod -Uri 'http://127.0.0.1:9086/api/auth/menus' -Headers @{ Authorization = $token } | ConvertTo-Json -Depth 8

# 3. 租户分页(观察 createTime / expireTime 的实际返回形态)
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:9086/api/system/tenant/page' `
  -Headers @{ Authorization = $token } -ContentType 'application/json' -Body '{"page":1,"size":10}' | ConvertTo-Json -Depth 5
```

判定标准：

- 登录返回 `success = true`，`data.role = ADMIN`；
- `/api/auth/menus` 返回 `roles = ["ADMIN"]`、`permissions = ["*"]`，`menus` 含「工作台 / 系统管理 / 任务调度」三组；
- 分页返回 `total ≥ 1`。

## 三、界面验收项

| # | 场景 | 操作 | 预期 |
|---|------|------|------|
| 1 | 登录 | 访问 `/login`，输入 `admin / Vt@123456` | 跳转工作台，右上角显示「系统管理员 / 管理员」 |
| 2 | 动态菜单 | 观察侧边栏 | 显示 工作台、系统管理（用户/租户/登录日志/角色/菜单）、任务调度（任务管理/执行日志） |
| 3 | 工作台 | 进入 `/dashboard` | 任务总数、执行成功/失败、用户总数等统计卡片有真实数据（示例库：1 个任务、25 条执行日志） |
| 4 | 用户管理 | `/system/user` | 列表 2 条（`admin`、`tester`）；新增/编辑/重置密码/启停/删除按钮均可见 |
| 5 | 租户管理 | `/system/tenant` | 列表 1 条「默认租户 / default / 企业版」，到期时间显示「长期有效」 |
| 6 | 到期时间回填 | 对租户点「编辑」，选择到期时间后保存，再次打开编辑 | 时间控件正确回填，不会出现空白或非法值 |
| 7 | 登录日志 | `/system/login-log` | 显示历史登录流水（成功/失败、IP、设备、时间） |
| 8 | 角色管理 | `/system/role` | 列表 2 条内置角色（ADMIN/USER，标记「内置」）；内置角色不可删除、开关禁用 |
| 9 | 菜单授权 | 编辑 `USER` 角色，勾选「系统管理 → 用户管理」并保存 | 保存成功；用 `tester` 登录后能看到并进入用户管理 |
| 10 | 菜单管理 | `/system/menu` | 树形表格展示 目录/页面/按钮 三级节点，权限码正确显示 |
| 11 | 新增菜单 | 新增一个 `MENU` 节点，组件标识填 `system/role/RoleList` | 保存成功；重新登录后侧边栏出现该菜单（若组件标识未注册则不生成路由） |
| 12 | 任务管理 | `/task/job` | 列表 1 条任务；暂停/恢复/立即执行/编辑/删除可用 |
| 13 | 执行日志 | `/task/log` | 25 条流水，可按状态筛选，详情页可打开 |
| 14 | 普通用户视角 | 退出后使用 `tester` 登录 | 侧边栏仅「工作台 / 任务调度」；系统管理相关按钮不可见 |
| 15 | 越权拦截 | `tester` 登录后直接访问 `/system/user` | 被守卫拦截，跳转 `/403` 或回工作台并提示无权限 |
| 16 | 会话失效 | 手动清空 localStorage 的 `vt-boot:token` 后刷新 | 自动跳转登录页并提示重新登录 |
| 17 | 退出登录 | 右上角退出 | 回到登录页；再次用另一账号登录时菜单与路由按新账号重建 |

## 四、时间字段约定

| 环节 | 约定 |
|------|------|
| 后端返回 | Jackson 3 默认 ISO-8601 字符串（如 `2026-11-20T09:12:33`），前端 `formatDateTime` 兼容 `T` 分隔、空格分隔与 Jackson 数组三种形态 |
| 前端提交 | 统一使用 `YYYY-MM-DDTHH:mm:ss`（`el-date-picker` 的 `value-format`） |
| 表单回填 | 统一经过 `toDateTimeString()` 归一化，避免后端形态变化导致回填异常 |

## 五、常见问题

| 现象 | 排查方向 |
|------|----------|
| 登录提示账号或密码错误 | 确认 `t_user.password` 为 32 位 MD5 或 `$2` 开头的 BCrypt；确认 `status = 1`、`lock_time` 为空 |
| 登录后侧边栏为空 | 检查 `/api/auth/menus` 是否 500；检查 `t_menu` 是否有数据、`t_role_menu` 是否已授权 |
| 页面空白且控制台提示找不到组件 | 菜单的 `component` 与 `src/router/components.ts` 中的键不一致 |
| 系统管理接口返回「无权限, 缺少权限 [...]」 | 当前账号角色未授权对应菜单/按钮，去「角色管理」勾选并重新登录 |
| 前端时间显示成数组 | 说明后端返回 Jackson 数组形态，`formatDateTime` 已兼容；若仍异常请贴出响应体 |
| 新增菜单后侧边栏不出现 | 需重新登录（权限与菜单在登录后拉取），并确认该菜单已授权给当前角色 |
