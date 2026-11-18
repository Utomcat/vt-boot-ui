/**
 * 任务模块前端常量: 对齐后端枚举与取值
 */

/**
 * 默认任务分组, 任务分组为空时后端使用该值
 */
export const DEFAULT_GROUP = 'DEFAULT'

/**
 * 错过触发(misfire)处理策略选项, 对齐后端 MisfirePolicyEnum
 */
export const MISFIRE_OPTIONS: { label: string; value: string }[] = [
    { label: '忽略错过的触发, 立即补执行一次后继续', value: 'FIRE_AND_PROCEED' },
    { label: '不补执行, 等待下一次触发', value: 'DO_NOTHING' },
    { label: '丢弃错过的触发', value: 'IGNORE' },
]

/**
 * 执行日志状态选项, 对齐后端 JobLogStatusEnum
 */
export const LOG_STATUS_OPTIONS: { label: string; value: number; tag: string }[] = [
    { label: '执行中', value: 0, tag: 'warning' },
    { label: '执行成功', value: 1, tag: 'success' },
    { label: '执行失败', value: 2, tag: 'danger' },
    { label: '被否决', value: 3, tag: 'info' },
]

/**
 * 获取错过触发策略的中文说明
 *
 * @param value 策略枚举名
 * @returns 中文说明, 未匹配时原样返回
 */
export function misfireLabel(value?: string): string {
    if (!value) return '-'
    const matched = MISFIRE_OPTIONS.find((item) => item.value === value)
    return matched ? matched.label : value
}

/**
 * 获取执行日志状态的中文说明
 *
 * @param status 状态值
 * @returns 中文说明, 未匹配时返回 "未知"
 */
export function logStatusLabel(status?: number): string {
    const matched = LOG_STATUS_OPTIONS.find((item) => item.value === status)
    return matched ? matched.label : '未知'
}

/**
 * 获取执行日志状态对应的 Element Plus 标签类型
 *
 * @param status 状态值
 * @returns 标签类型, 未匹配时返回 info
 */
export function logStatusTagType(status?: number): string {
    const matched = LOG_STATUS_OPTIONS.find((item) => item.value === status)
    return matched ? matched.tag : 'info'
}
