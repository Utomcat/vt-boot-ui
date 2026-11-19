# 编码规范（VT-Boot-UI）

> 本文为 `vt-boot-ui` 前端工程的编码约定，用于保持代码风格、结构与命名的一致性。技术栈：Vue 3（`<script setup>`）+ TypeScript + Vite 8 + Element Plus。

## 一、格式

- 编码 UTF-8，文件末尾保留换行，行尾不留空格。
- 缩进：`.ts` 文件使用 **4 空格**；`.vue` / `.css` 使用 **2 空格**。新增文件与同目录现有文件保持一致，禁止 Tab。
- 模板中属性较多时可多行书写，保持一个属性一行、缩进对齐。
- 语句结尾不强制分号，同一文件内保持统一（现有代码多数省略分号）。
- 导入顺序：`vue` / `vue-router` 等框架与第三方库在前，本地模块在后；单行 `import { a, b } from 'x'`，现有代码在 `{}` 内不加空格。

## 二、注释

- `.ts` 文件顶部用 `/** ... */` 块注释说明模块用途（如 `VtJob.ts`、`TaskConstants.ts`）。
- 导出的函数一律写 JSDoc，包含 `@param`（每个参数）与 `@returns`；参数说明用中文。
- 接口（`interface`）字段用 `//` 单行中文注释说明含义，写在字段上一行。
- 组件内复杂逻辑用 `//` 简短中文注释说明意图（如「根据路径前缀计算侧边栏高亮项」）。
- 禁止保留注释掉的代码块，禁止无意义注释。

示例：

```typescript
/**
 * 任务保存参数接口(对齐后端 VtJobSaveDTO), 用于新增与修改任务
 */
export interface VtJobSaveDTO {
    // 任务名称
    name?: string
    // 任务分组, 为空时后端使用 DEFAULT
    group?: string
}
```

## 三、命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 接口 / 类型 | `PascalCase`，与后端模型同名 | `VtJob`、`VtJobLog`、`Result`、`MultiResult` |
| 常量 | `UPPER_SNAKE_CASE` | `DEFAULT_GROUP`、`MISFIRE_OPTIONS`、`LOG_STATUS_OPTIONS` |
| 接口函数 | 动词开头，返回 `Promise` | `fetchJobPage`、`createJob`、`pauseJob`、`cleanJobLog` |
| 组件文件 | `PascalCase.vue` | `JobList.vue`、`AdminLayout.vue` |
| 组件内变量 | 小驼峰 | `loading`、`submitting`、`dateRange`、`summaryCards` |
| 工具函数 | 小驼峰、动词开头 | `buildPageQuery`、`formatDateTime`、`misfireLabel` |

- 模型命名对齐后端：`VtJob` ↔ `VtJobVO`、`VtJobLog` ↔ `VtJobLogVO`。
- 查询类用 `fetchXxx`，动作类直接用动词（`create` / `update` / `pause` / `resume` / `trigger` / `delete` / `clean`）。
- 布尔量用 `is` / `paused` 等语义名（如 `isSuccess`、`isPageResult`）。

## 四、Vue 单文件组件

- 统一使用 `<script setup lang="ts">` 组合式 API。
- 单文件内部顺序：`<template>` → `<script>` → `<style scoped>`。
- 响应式优先 `ref` / `reactive`，派生状态用 `computed`，副作用用 `onMounted`。
- Element Plus 组件以 `el-` 前缀使用（`el-table`、`el-form`、`el-dialog` 等），图标可直接使用全局注册的图标组件或 `icon="Search"` 字符串。
- 页面容器沿用统一的工具类：`.page-title`、`.page-card`、`.page-toolbar`、`.page-pagination`。
- 组件内样式使用 `<style scoped>`，避免全局污染；仅全局通用类写入 `src/style.css`。

## 五、TypeScript 与模型

- 工程开启 `strict`、`noUnusedLocals`、`noUnusedParameters`，提交前须通过类型检查。
- 模型优先用 `interface` 声明；列表 / 记录类泛型用 `Record<string, any>`。
- 接口函数显式标注返回类型，如 `Promise<Result<VtJob>>`、`Promise<MultiResult<VtJobLog>>`。
- 尽量收敛 `any`：动态参数、JSON 参数等确有需要时使用 `Record<string, any>`。
- 与后端一致的字段命名直接沿用（`jobName`、`triggerName`、`durationMs` 等），不做二次改名。

## 六、接口与请求

- 所有后端调用集中在 `src/api/` 下（按业务域分文件：`auth.ts` / `user.ts` / `tenant.ts` / `loginLog.ts` / `task.ts`），**视图组件禁止直接 `import axios`**。
- 分页查询：任务模块的 GET 接口统一经 `buildPageQuery` 展平参数；系统管理模块的 POST 接口直接以查询对象作为请求体。
- 统一响应校验交由 `src/utils/request.ts` 的拦截器处理，页面只消费 `res.data`。
- 用户反馈统一用 `ElMessage`（成功 / 失败提示）与 `ElMessageBox`（确认 / 输入弹窗）。
- 异步请求用 `try / finally` 维护 `loading` 状态，异常交给拦截器或按需 `catch`。

## 七、状态管理

- 页面级状态使用组件内 `ref` / `reactive`，不滥用全局 store。
- 跨页面共享的状态（登录令牌、当前用户、角色判定）统一放入 `src/stores`（如 `user.ts`），令牌持久化交由 `src/utils/auth.ts`。
- 需要新增全局状态时再引入 `defineStore`，并按业务域放置于 `src/stores`。

## 八、样式

- 颜色、主色等尽量复用 `src/style.css` 中的 CSS 变量（`--app-primary` 等）。
- 可复用的标题、工具条、卡片、分页样式写入全局类，页面内不重复定义。
- 明细页的代码块（任务参数、异常信息）沿用深色背景 + `pre-wrap` 换行的展示风格。

## 九、时间与格式化

- 日期时间统一走 `src/utils/date.ts`：`formatDateTime`（`YYYY-MM-DD HH:mm:ss`）、`formatDate`（`YYYY-MM-DD`）。
- 耗时统一走 `formatDuration`：小于 1000ms 显示毫秒，否则显示秒（保留 3 位小数）。
- 日期选择器 `value-format` 统一为 `YYYY-MM-DD HH:mm:ss`，与后端字符串格式对齐。

## 十、提交

- 提交信息 `type(scope): 中文描述`，type ∈ `feat/fix/refactor/docs/style/test/build/chore`。
- 一次提交只做一件事；提交前确保 `npm run build` 可通过。
- 涉及模型 / 枚举变更时，需同步后端字段并在此次提交说明中写清对齐关系。
