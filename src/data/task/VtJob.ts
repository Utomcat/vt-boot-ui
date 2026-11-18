/**
 * 定时任务信息接口(对齐后端 VtJobVO)
 */
export interface VtJob {
    // 任务名称
    name: string
    // 任务分组
    group?: string
    // cron 表达式
    cron?: string
    // 任务描述
    description?: string
    // 任务执行器 Bean 名称
    executor?: string
    // 错过触发的处理策略: FIRE_AND_PROCEED / DO_NOTHING / IGNORE
    misfire?: string
    // 任务参数
    params?: Record<string, any>
    // 租户 ID
    tenantId?: string
    // 是否已暂停
    paused?: boolean
}
