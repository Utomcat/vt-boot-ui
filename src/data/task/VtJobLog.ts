/**
 * 任务执行日志接口(对齐后端 VtJobLogVO)
 */
export interface VtJobLog {
    // 主键
    id?: number
    // 任务名称
    jobName?: string
    // 任务分组
    jobGroup?: string
    // 触发器名称
    triggerName?: string
    // 计划触发时间
    fireTime?: string
    // 实际开始时间
    startTime?: string
    // 结束时间
    endTime?: string
    // 耗时(毫秒)
    durationMs?: number
    // 状态: 0-执行中 1-成功 2-失败 3-被否决
    status?: number
    // 任务参数(JSON)
    params?: string
    // 异常信息
    errorMsg?: string
    // 执行实例标识
    instanceId?: string
    // 租户 ID
    tenantId?: string
    // 创建时间
    createTime?: string
}
