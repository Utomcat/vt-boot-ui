# vt-boot-ui

![Vue](https://img.shields.io/badge/Vue-3.5.32-4FC08D?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0.10-646CFF?logo=vite&logoColor=white)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.14.0-409EFF?logo=element&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0.4-FFD859)
![Vue Router](https://img.shields.io/badge/Vue%20Router-5.0.6-42B883)
![Axios](https://img.shields.io/badge/Axios-1.16.0-5A29E4)
![Node](https://img.shields.io/badge/Node-%E2%89%A520-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-Apache%202.0-green)

**VT-Boot 后台管理系统前端**，是后端工程 `vt-boot` 的官方管理端，基于 **Vue 3 + Vite 8 + Element Plus** 构建，对接 `vt-boot-example-admin` 提供的认证、系统管理与定时任务接口，覆盖登录认证、用户管理、租户管理、登录审计与任务调度运维。

- **作者**：ranyk
- **所属体系**：VT-Boot（后端脚手架 `vt-boot` + 后台管理端 `vt-boot-ui`）
- **项目定位**：`vt-boot` 项目的**通用后台管理系统**，而非单一的定时任务操作界面
- **项目状态**：🚧 开发中
- **最后更新**：2026-11-20

---

## 📚 文档导航

> 根目录 `README.md` 仅作为总览入口，其余详细说明均位于 [`doc/`](./doc) 目录下。

### 入门

| 文档 | 说明 |
|------|------|
| [快速开始](./doc/quickstart.md) | 环境要求、依赖安装、登录联调、构建与验证 |
| [架构设计](./doc/architecture.md) | 整体结构、目录分层、认证链路、路由与分包 |
| [目录与模块说明](./doc/modules.md) | 各目录与关键文件职责、页面能力与新增页面指引 |

### 使用

| 文档 | 说明 |
|------|------|
| [配置说明](./doc/configuration.md) | Vite / TypeScript / npm 配置项与部署建议 |
| [接口说明](./doc/api.md) | 认证、系统管理、任务管理与执行日志接口、统一响应结构 |
| [数据模型与常量](./doc/data-models.md) | 与后端对齐的模型、响应体、分页工具与常量映射 |

### 规范与维护

| 文档 | 说明 |
|------|------|
| [编码规范](./doc/CODING-STANDARDS.md) | 格式、注释、命名、组件、接口与状态等约定 |
| [常见问题](./doc/faq.md) | 安装、登录、联调、构建、使用等高频问题排查 |

---

## 📖 项目概述

`vt-boot-ui` 是 `vt-boot` 体系的 **后台管理前端**，承担整个脚手架的管理端职责：

- **后端能力全部由 `vt-boot` 提供**：认证与权限来自 `vt-boot-satoken-starter`，示例业务来自 `vt-boot-example-admin`，任务调度来自 `vt-boot-task-admin-starter`，前端只负责界面、交互与统一响应处理。
- 采用 **单页应用（SPA）** 形态，`Vue Router` 使用 history 模式，页面级组件懒加载。
- 以 **组合式 API（`<script setup>`）+ TypeScript** 编写，`Pinia` 管理登录态，`Axios` 统一请求。
- 风格、配色与 `vt-boot` 保持一致，作为同一产品线的官方管理端。

框架只面向 **现代浏览器**，不追求对旧版 IE 的兼容。

## ✨ 核心能力

| 模块 | 页面 | 能力 |
|------|------|------|
| 身份认证 | 登录页 `/login` | 账号密码登录、令牌持久化、401 自动续期、失效跳转 |
| 工作台 | `/dashboard` | 任务与用户概览统计、快捷入口、最近登录、系统信息 |
| 系统管理 | `/system/user` | 用户分页查询、增删改、重置密码、启停控制（需 `system:user:*`） |
| 系统管理 | `/system/tenant` | 租户分页查询、增删改、套餐与配额维护、启停控制（需 `system:tenant:*`） |
| 系统管理 | `/system/login-log` | 登录审计流水查询：结果、失败原因、IP、设备（需 `system:login-log:list`） |
| 系统管理 | `/system/role` | 角色分页查询、增删改、启停、菜单与按钮级授权（需 `system:role:*`） |
| 系统管理 | `/system/menu` | 目录 / 页面 / 按钮三级菜单树维护（需 `system:menu:*`） |
| 任务调度 | `/task/job` | 定时任务增删改查、暂停 / 恢复 / 立即执行 |
| 任务调度 | `/task/log` | 执行日志按状态与时间筛选、状态统计、历史清理 |
| 个人中心 | `/profile` | 当前账号资料、角色、会话信息与退出登录 |

### 关键特性

- 🔐 **完整登录闭环**：`Sa-Token` 令牌自动注入 `Authorization` 头，401 时用刷新令牌静默续期，续期失败自动回到登录页。
- 🛡️ **RBAC 动态菜单**：登录后调用 `/api/auth/menus` 拉取角色、权限码与菜单树，前端按 `component` 白名单动态注册路由，侧边栏与按钮（`v-perm`）均由权限码驱动，越权访问统一跳转 403。
- 🎯 **任务场景完整保留**：任务管理、详情、执行日志与日志详情全部沿用并融入统一管理端。
- 🎨 **Element Plus 中文体验**：内置 `zh-cn` 语言包并全量注册图标，表格 / 表单 / 弹窗风格统一。
- 📊 **工作台概览**：任务总数、执行成功 / 失败、用户总数等统计卡片实时汇总。
- 🔌 **统一响应处理**：Axios 拦截器对 `Result / MultiResult` 统一校验 `success`，失败自动弹出提示。
- ⚡ **Vite 8 构建**：极速冷启动，产物启用 gzip 压缩与手动分包。

## ❌ vt-boot-ui 不做什么

- ❌ 不内置 Mock 数据，需连接真实后端联调
- ❌ 不实现后端业务逻辑，鉴权、数据与权限均以后端为准
- ❌ 不兼容 IE 及过旧的浏览器内核

## 🛠️ 技术栈

| 类别 | 技术 / 版本 |
|------|-------------|
| 运行时 | Node ≥ 20（推荐 LTS）、npm |
| 语言 | TypeScript 5、JavaScript（ESM） |
| 框架 | Vue 3.5.32（`<script setup>`） |
| 构建 | Vite 8.0.10、vite-plugin-compression 0.5.1 |
| UI 组件 | Element Plus 2.14.0、@element-plus/icons-vue 2.3.2 |
| 路由 | Vue Router 5.0.6（history 模式） |
| 状态管理 | Pinia 3.0.4 |
| 网络请求 | Axios 1.16.0 |
| 包管理 | npm（镜像源 `registry.npmmirror.com`） |

## 📁 项目结构

```text
vt-boot-ui/
├── index.html                        # 应用入口 HTML（标题：VT-Boot 后台管理系统）
├── package.json                      # 依赖与脚本（dev / build / preview）
├── vite.config.js                    # Vite 配置：端口 5180、/api 代理、gzip、手动分包
├── tsconfig.json                     # TypeScript 配置
├── tsconfig.node.json                # Node 侧 TS 配置（供 vite.config 使用）
├── .npmrc                            # npm 镜像源（npmmirror）
├── doc/                              # 项目详细文档（快速开始/架构/模块/配置/接口/模型/规范/FAQ）
├── public/
│   └── favicon.svg                   # 站点图标
└── src/
    ├── main.js                       # 应用入口：挂载 Pinia / Router / Element Plus（中文）
    ├── App.vue                       # 根组件（RouterView）
    ├── style.css                     # 全局样式与通用工具类
    ├── router/
    │   ├── index.ts                  # 路由表 + 登录守卫 + 管理员权限守卫
    │   └── menu.ts                   # 侧边栏菜单配置与按角色过滤
    ├── stores/user.ts                # 登录态：令牌、用户信息、角色判定、登录/退出
    ├── layouts/AdminLayout.vue       # 后台框架：可折叠侧边栏 + 面包屑 + 用户下拉
    ├── api/                          # auth / user / tenant / loginLog / task 接口封装
    ├── data/                         # auth / system / task 模型、统一响应、分页、常量
    ├── utils/                        # request（Axios）/ auth（凭证存储）/ date（格式化）
    └── views/
        ├── auth/Login.vue            # 登录页
        ├── dashboard/Dashboard.vue   # 工作台
        ├── system/                   # 用户管理 / 租户管理 / 登录日志
        ├── task/                     # 任务管理 / 详情 / 执行日志 / 日志详情
        ├── profile/Profile.vue       # 个人中心
        └── error/NotFound.vue        # 404
```

## 🚀 快速开始

```bash
# 1. 确认环境（需 Node 20+）
node -v

# 2. 安装依赖（已配置 npmmirror 镜像）
npm install

# 3. 启动开发服务（默认 http://localhost:5180，/api 代理到 http://127.0.0.1:9086）
npm run dev

# 4. 生产构建（产物输出到 dist/）
npm run build
```

> 首次访问会跳转到登录页 `/login`，使用后端 `t_user` 表中的账号登录。示例库内置两个账号：`admin`（`role = ADMIN`，拥有全部权限）与 `tester`（`role = USER`，仅工作台与任务调度）。
> 登录后侧边栏与按钮均由后端 RBAC 数据驱动，详细联调与验收步骤见 [联调验收清单](./doc/verify.md)；环境准备见 [快速开始](./doc/quickstart.md)。

## 📜 License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)

---

📅 最后更新：2026-11-20
