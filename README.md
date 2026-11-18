# vt-boot-ui

VT-Boot 任务管理控制台前端，基于 Vue 3 + Vite + Element Plus 构建，对接 `vt-boot-task-admin-starter` 提供的定时任务管理接口。

## 技术栈

- Vue 3（`<script setup>`）+ Vite
- Element Plus（中文语言包）+ `@element-plus/icons-vue`
- Vue Router（history 模式）
- Pinia
- Axios（统一 `Result / MultiResult` 响应处理）

## 目录结构

```
src/
├── api/                     # 接口封装
│   └── task.ts              # 任务管理 + 执行日志接口
├── data/                    # 数据模型
│   ├── page/PageParams.ts   # 分页参数展平工具
│   ├── result/              # Result / MultiResult 响应模型
│   └── task/                # VtJob / VtJobSaveDTO / VtJobLog / 常量枚举
├── layouts/
│   └── AdminLayout.vue      # 后台整体框架（侧边栏 + 顶栏）
├── router/index.ts          # 路由表
├── utils/
│   ├── request.ts           # Axios 实例与响应拦截
│   └── date.ts              # 时间/耗时格式化
├── views/task/
│   ├── JobList.vue          # 任务管理（列表 + 新增/编辑 + 暂停/恢复/执行/删除）
│   ├── JobDetail.vue        # 任务详情
│   ├── JobLogList.vue       # 执行日志（状态统计 + 筛选 + 清理）
│   └── JobLogDetail.vue     # 执行日志详情
├── App.vue
├── main.js
└── style.css
```

## 页面与接口对应

| 页面 | 路由 | 后端接口 |
| --- | --- | --- |
| 任务管理 | `/task/job` | `GET /api/task/list`、`POST /api/task/create`、`PUT /api/task/update`、`PUT /api/task/pause`、`PUT /api/task/resume`、`PUT /api/task/trigger`、`DELETE /api/task/delete` |
| 任务详情 | `/task/job/detail` | `GET /api/task/detail` |
| 执行日志 | `/task/log` | `GET /api/task/log/list`、`GET /api/task/log/summary`、`DELETE /api/task/log/clean` |
| 日志详情 | `/task/log/detail/:id` | `GET /api/task/log/detail/{id}` |

## 本地开发

后端示例服务（`vt-boot-example-admin`）默认端口为 `9086`，且已在 `sa-token.yaml` 中将 `/api/task/**` 放开鉴权，便于前端直接联调。

```bash
# 安装依赖
npm install

# 启动开发服务（默认 http://localhost:5180，已配置 /api 代理到 127.0.0.1:9086）
npm run dev

# 生产构建
npm run build
```

如需调整后端地址，修改 `vite.config.js` 中的 `backend` 常量即可。

## 响应结构约定

后端统一返回：

```jsonc
{
  "code": "SUCCESS",   // 成功为 SUCCESS，失败为业务错误码
  "success": true,     // 是否成功
  "msg": "SUCCESS",    // 提示信息
  "data": {},          // 业务数据
  "total": 0,          // 仅分页接口
  "page": 1,           // 仅分页接口
  "size": 10           // 仅分页接口
}
```

前端在 `src/utils/request.ts` 拦截器中统一校验 `success`，失败时自动弹出 `ElMessage` 并抛出异常。
