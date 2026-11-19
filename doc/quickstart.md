# 快速开始

本文介绍如何在本地完成 `vt-boot-ui` 的环境准备、依赖安装、登录联调与构建验证。

## 一、环境要求

| 项目 | 要求 | 说明 |
|------|------|------|
| Node.js | **≥ 20**（推荐 LTS） | Vite 8 依赖现代 Node，版本过低会启动失败 |
| 包管理器 | npm | 项目 `.npmrc` 已配置 `registry.npmmirror.com` 镜像 |
| 浏览器 | 现代浏览器（Chrome / Edge / Firefox 等） | 不支持 IE 及过旧内核 |
| 后端服务 | `vt-boot-example-admin`，默认端口 `9086` | 联调需先启动后端 |

> `vt-boot-ui` 是 `vt-boot` 项目的后台管理前端，源码位于 `VT-Boot/vt-boot-ui` 目录，后端能力由 `vt-boot`（`vt-boot-example-admin` + `vt-boot-satoken-starter` + `vt-boot-task-admin-starter`）提供。

## 二、安装依赖

```bash
cd vt-boot-ui
npm install
```

项目已内置 `.npmrc`（镜像源 `registry.npmmirror.com`），无需额外配置即可加速安装。

## 三、启动开发服务

```bash
npm run dev
```

- 默认地址：`http://localhost:5180`
- `/api` 请求由 Vite 代理转发到后端 `http://127.0.0.1:9086`
- 未登录访问任意页面会重定向到登录页 `/login`

## 四、登录与联调

1. 首次联调前，先在目标库执行 RBAC 初始化脚本（幂等，可重复执行）：

```bash
mysql -h<host> -P<port> -u<user> -p <database> < vt-boot-example-admin/src/main/resources/db/rbac-mysql.sql
```

2. 启动后端示例应用 `vt-boot-example-admin`（默认端口 `9086`）。
3. 打开 `http://localhost:5180`，进入登录页，使用后端 `t_user` 表中的账号登录；示例库内置 `admin`（`role = ADMIN`）与 `tester`（`role = USER`）。
4. 登录成功后前端会调用 `/api/auth/menus` 拉取角色、权限码与菜单树，侧边栏与按钮（`v-perm`）均由此驱动；菜单 `component` 需存在于 `src/router/components.ts` 的注册表中。
5. 前端开发服务通过 `vite.config.js` 中的 `backend` 常量指向后端：

```js
// 后端示例服务默认端口为 9086
const backend = 'http://127.0.0.1:9086'
```

后端地址变化时，修改该常量后重启 `npm run dev` 即可。接口清单见 [接口说明](./api.md)。

> 登录与刷新令牌走 `/api/auth/**`，系统管理与 RBAC 走 `/api/system/**`（按权限码校验），任务调度走 `/api/task/**`。
> 完整验收步骤与命令见 [联调验收清单](./verify.md)。

## 五、构建与本地预览

```bash
# 生产构建，产物输出到 dist/
npm run build

# 本地预览构建产物
npm run preview
```

构建细节（gzip 压缩、手动分包、警告阈值）见 [配置说明](./configuration.md)。

## 六、验证

| 目标 | 地址 / 操作 |
|------|-------------|
| 登录页 | `http://localhost:5180` → 重定向 `/login` |
| 工作台 | 登录成功进入 `/dashboard`，应显示统计卡片与快捷入口 |
| 用户管理 | 管理员可见「系统管理 → 用户管理」，应能分页加载并搜索用户 |
| 租户管理 | 「系统管理 → 租户管理」，应能加载租户列表并维护套餐 / 配额 |
| 登录日志 | 「系统管理 → 登录日志」，应能看到本次登录记录 |
| 角色管理 | 「系统管理 → 角色管理」，应显示内置角色并可勾选菜单授权 |
| 菜单管理 | 「系统管理 → 菜单管理」，应显示目录 / 页面 / 按钮三级树 |
| 任务管理 | 侧边栏「任务调度 → 任务管理」，应能加载任务列表并新增任务 |
| 执行日志 | 侧边栏「任务调度 → 执行日志」，应显示状态统计卡片与日志列表 |

若列表为空且无报错，说明接口连通正常，只是数据库暂无数据；若出现 404 / 401，见 [常见问题](./faq.md)。

## 七、常见问题

依赖安装、登录失效、端口占用、跨域、鉴权等高频问题见 [常见问题](./faq.md)。
