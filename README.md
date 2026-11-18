# vt-boot-ui

![Vue](https://img.shields.io/badge/Vue-3.5.32-4FC08D?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0.10-646CFF?logo=vite&logoColor=white)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.14.0-409EFF?logo=element&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0.4-FFD859)
![Vue Router](https://img.shields.io/badge/Vue%20Router-5.0.6-42B883)
![Axios](https://img.shields.io/badge/Axios-1.16.0-5A29E4)
![Node](https://img.shields.io/badge/Node-%E2%89%A520-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-Apache%202.0-green)

**VT-Boot 任务管理控制台前端**，基于 **Vue 3 + Vite 8 + Element Plus** 构建，对接后端 `vt-boot-task-admin-starter` 提供的定时任务管理接口，为 VT-Boot 体系补齐「任务调度 + 执行日志」的可视化运维能力。

- **作者**：ranyk
- **所属体系**：VT-Boot（后端脚手架 `vt-boot` + 任务控制台 `vt-boot-ui`）
- **项目状态**：🚧 开发中
- **最后更新**：2026-11-18

---

## 📚 文档导航

> 本文件为 `vt-boot-ui` 的总览入口，以下按主题分节索引。

### 入门

| 章节 | 说明 |
|------|------|
| [项目概述](#-项目概述) | 定位、与后端的关系 |
| [核心特性](#-核心特性) | 控制台能力亮点 |
| [技术栈](#-技术栈) | 框架与依赖版本 |
| [项目结构](#-项目结构) | 目录与文件职责 |

### 使用

| 章节 | 说明 |
|------|------|
| [页面与路由](#-页面与路由) | 四个页面与路由映射 |
| [接口说明](#-接口说明) | 任务管理与执行日志接口 |
| [本地开发](#-本地开发) | 安装、启动、联调 |
| [构建与部署](#-构建与部署) | 打包产物与反向代理 |

### 规范与维护

| 章节 | 说明 |
|------|------|
| [响应结构约定](#-响应结构约定) | Result / MultiResult 与拦截器 |
| [数据模型与常量](#-数据模型与常量) | 任务、日志模型与枚举 |
| [常见问题](#-常见问题) | 构建、联调、鉴权等高频问题排查 |

---

## 📖 项目概述

`vt-boot-ui` 是 VT-Boot 体系的 **前端展示层**，专注于定时任务的可视化控制台：

- 后端能力由 `vt-boot`（`vt-boot-task-admin-starter`）提供，前端只负责界面、交互与统一响应处理。
- 采用 **单页应用（SPA）** 形态，`Vue Router` 采用 history 模式，页面级组件懒加载。
- 以 **组合式 API（`<script setup>`）+ TypeScript** 编写，配合 `Pinia` 管理状态、`Axios` 统一请求。
- 风格、配色与 `vt-boot` 保持一致，作为同一产品线的配套控制台。

框架只面向 **现代浏览器**，不追求对旧版 IE 的兼容。

## ✨ 核心特性

- 🎯 **专注定时任务场景**：围绕任务的增删改查、暂停 / 恢复、立即执行与执行日志展开，功能聚焦、开箱即用。
- 🧩 **Vue 3 组合式 API**：全量 `<script setup>` + TypeScript，逻辑与视图清晰分离。
- 🎨 **Element Plus 中文体验**：内置 `zh-cn` 语言包并全量注册图标，表格 / 表单 / 弹窗风格统一。
- 📊 **执行日志状态统计**：执行中 / 成功 / 失败 / 被否决四类状态卡片实时汇总。
- 🔌 **统一响应处理**：Axios 拦截器对 `Result / MultiResult` 统一校验 `success`，失败自动弹出提示。
- 🧾 **任务参数可视化**：支持 JSON 参数录入、格式化展示与异常信息高亮呈现。
- ⚡ **Vite 8 构建**：极速冷启动，产物启用 gzip 压缩与手动分包。
- 🧭 **路由懒加载**：页面级 `import()` 拆分，配合 history 模式与嵌套布局。

## ❌ vt-boot-ui 不做什么

- ❌ 不是通用中后台 / 低代码模板，只服务 VT-Boot 定时任务场景
- ❌ 不内建登录、用户、权限页面，鉴权交由后端与网关承担（任务接口默认放开）
- ❌ 不内置 Mock 数据，需连接真实后端联调
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
├── index.html                        # 应用入口 HTML（标题：VT-Boot 任务管理控制台）
├── package.json                      # 依赖与脚本（dev / build / preview）
├── vite.config.js                    # Vite 配置：端口 5180、/api 代理、gzip、手动分包
├── tsconfig.json                     # TypeScript 配置
├── tsconfig.node.json                # Node 侧 TS 配置（供 vite.config 使用）
├── .npmrc                            # npm 镜像源（npmmirror）
├── .gitignore                        # 忽略 node_modules / dist 等
├── public/
│   └── favicon.svg                   # 站点图标
└── src/
    ├── main.js                       # 应用入口：挂载 Pinia / Router / Element Plus（中文）
    ├── App.vue                       # 根组件（RouterView）
    ├── style.css                     # 全局样式与通用工具类（页面标题、工具条、分页等）
    ├── api/
    │   └── task.ts                   # 任务管理 + 执行日志接口封装
    ├── data/
    │   ├── page/PageParams.ts        # 分页参数展平工具 buildPageQuery
    │   ├── result/
    │   │   ├── Result.ts             # 通用响应模型 + isSuccess / isPageResult
    │   │   └── MultiResult.ts        # 分页响应模型
    │   └── task/
    │       ├── VtJob.ts              # 任务模型（对齐 VtJobVO）
    │       ├── VtJobSaveDTO.ts       # 任务保存参数（新增 / 修改）
    │       ├── VtJobLog.ts           # 执行日志模型（对齐 VtJobLogVO）
    │       └── TaskConstants.ts      # 分组默认值、错过策略、日志状态枚举与标签工具
    ├── layouts/
    │   └── AdminLayout.vue           # 后台整体框架（深色侧边栏 + 顶栏 + 刷新）
    ├── router/
    │   └── index.ts                  # 路由表（history 模式、懒加载）
    ├── utils/
    │   ├── request.ts                # Axios 实例与统一响应拦截
    │   └── date.ts                   # 日期 / 耗时格式化
    └── views/
        └── task/
            ├── JobList.vue           # 任务管理（查询 + 新增 / 编辑 + 暂停 / 恢复 / 执行 / 删除）
            ├── JobDetail.vue         # 任务详情
            ├── JobLogList.vue        # 执行日志（状态统计 + 筛选 + 清理）
            └── JobLogDetail.vue      # 执行日志详情
```

## 🧭 页面与路由

| 页面 | 路由 | 说明 |
|------|------|------|
| 任务管理 | `/task/job` | 任务列表、按名称 / 分组查询，新增 / 编辑、暂停 / 恢复 / 执行一次 / 删除 |
| 任务详情 | `/task/job/detail?name=&group=` | 任务明细与参数查看，支持暂停 / 恢复 / 立即执行 / 删除 |
| 执行日志 | `/task/log` | 状态统计卡片，按任务名 / 状态 / 时间范围筛选，清理历史日志 |
| 日志详情 | `/task/log/detail/:id` | 单次执行明细、任务参数与异常信息 |
| 首页 | `/` → `/task/job` | 默认重定向到任务管理 |

> 布局统一由 `AdminLayout.vue` 承载：深色侧边栏（任务管理 / 执行日志）+ 顶栏（页面标题 + 刷新）。

## 🔌 接口说明

所有接口以 `/api/task` 为前缀，开发环境由 Vite 代理转发到后端。

### 任务管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/task/list` | 分页查询任务（`page` / `size` / `name` / `group`） |
| GET | `/api/task/detail` | 查询任务详情（`group` / `name`） |
| POST | `/api/task/create` | 新增任务 |
| PUT | `/api/task/update` | 修改任务 |
| PUT | `/api/task/pause` | 暂停任务（`group` / `name`） |
| PUT | `/api/task/resume` | 恢复任务（`group` / `name`） |
| PUT | `/api/task/trigger` | 立即执行一次（`group` / `name`） |
| DELETE | `/api/task/delete` | 删除任务（`group` / `name`） |

### 执行日志

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/task/log/list` | 分页查询执行日志（`page` / `size` / `jobName` / `status` / `from` / `to`） |
| GET | `/api/task/log/detail/{id}` | 查询日志详情 |
| GET | `/api/task/log/summary` | 按状态统计日志数量（`running` / `success` / `failed` / `vetoed`） |
| DELETE | `/api/task/log/clean` | 按保留天数清理历史日志（`days`，不传默认 30 天） |

## 🚀 本地开发

后端示例服务（`vt-boot-example-admin`）默认端口为 `9086`，并在 `sa-token.yaml` 中将 `/api/task/**` 放开鉴权，便于前端直接联调。

```bash
# 1. 安装依赖（项目已配置 npmmirror 镜像，安装更快）
npm install

# 2. 启动开发服务（默认 http://localhost:5180，/api 已代理到 127.0.0.1:9086）
npm run dev

# 3. 生产构建（产物输出到 dist/）
npm run build

# 4. 本地预览构建产物
npm run preview
```

如需调整后端地址，修改 `vite.config.js` 中的 `backend` 常量即可。

## 📦 构建与部署

- `npm run build` 输出静态资源到 `dist/`，可直接交给 Nginx 或任意静态服务器托管。
- 大于 `10KB` 的产物会生成 `.gz` 文件（`vite-plugin-compression`，gzip 算法）。
- 依赖按手动分包策略拆分：`vue-vendor`（vue / vue-router / pinia）、`element-plus`、`utils`（axios），利于浏览器缓存。
- 生产环境建议 **同源部署**：`/api` 由网关或 Nginx 反向代理到后端服务，前端无需再配置跨域。

## 🧩 响应结构约定

后端统一返回 `Result<T>`，分页接口返回 `MultiResult<T>`：

```jsonc
// 普通响应 Result<T>
{
  "code": "SUCCESS",   // 成功为 SUCCESS，失败为业务错误码
  "success": true,     // 是否成功
  "msg": "SUCCESS",    // 提示信息
  "data": {}           // 业务数据
}

// 分页响应 MultiResult<T>
{
  "code": "SUCCESS",
  "success": true,
  "msg": "SUCCESS",
  "data": [],          // 列表数据
  "total": 0,          // 总记录数
  "page": 1,           // 当前页码
  "size": 10           // 每页记录数
}
```

前端在 `src/utils/request.ts` 拦截器中统一校验：`success === true` 且 `code` 为 `SUCCESS`（或缺省）视为成功并返回响应体，否则通过 `ElMessage.error` 提示并抛出异常；请求超时（默认 30s）会单独给出提示。

## 🧱 数据模型与常量

- `VtJob` / `VtJobSaveDTO`：任务信息与保存参数（`name` / `group` / `cron` / `executor` / `misfire` / `params` / `tenantId` / `description`）。
- `VtJobLog`：执行日志（状态 `0` 执行中 / `1` 成功 / `2` 失败 / `3` 被否决，含耗时、异常、实例标识等）。
- `TaskConstants.ts`：`DEFAULT_GROUP = 'DEFAULT'`、`MISFIRE_OPTIONS`（`FIRE_AND_PROCEED` / `DO_NOTHING` / `IGNORE`）、`LOG_STATUS_OPTIONS`，以及 `misfireLabel` / `logStatusLabel` / `logStatusTagType` 等展示工具。

## ❓ 常见问题

- **依赖安装慢或失败**：项目 `.npmrc` 已使用 `registry.npmmirror.com`，如仍失败可检查网络或临时切换官方源。
- **接口 404 / 跨域**：确认后端 `9086` 已启动，或按需修改 `vite.config.js` 的 `backend` 常量。
- **401 / 鉴权失败**：确认后端已放开 `/api/task/**`（示例 `sa-token.yaml` 已配置）。
- **端口被占用**：修改 `vite.config.js` 中 `server.port`（默认 `5180`）。
- **详情页无数据**：详情页通过查询参数 `name` / `group` 取数，直接访问时需携带对应参数。

## 📜 License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)

---

📅 最后更新：2026-11-18
