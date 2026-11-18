/**
 * 任务保存参数接口(对齐后端 VtJobSaveDTO), 用于新增与修改任务
 */
export interface VtJobSaveDTO {
    // 任务名称
    name?: string
    // 任务分组, 为空时后端使用 DEFAULT
    group?: string
    // cron 表达式
    cron?: string
    // 任务描述
    description?: string
    // 任务执行器 Bean 名称
    executor?: string
    // 错过触发的处理策略
    misfire?: string
    // 任务参数
    params?: Record<string, any>
    // 租户 ID
    tenantId?: string
}
