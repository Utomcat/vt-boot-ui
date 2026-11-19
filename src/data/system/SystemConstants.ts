/**
 * 系统管理模块前端常量: 对齐后端状态、角色、套餐与登录方式取值
 */

/** 管理员角色编码 */
export const ROLE_ADMIN = 'ADMIN'

/**
 * 通用启停状态选项, 对齐后端 status 字段(1-正常 0-禁用)
 */
export const STATUS_OPTIONS: { label: string; value: number; tag: string }[] = [
    { label: '正常', value: 1, tag: 'success' },
    { label: '禁用', value: 0, tag: 'danger' },
]

/**
 * 用户角色选项, 对齐后端 role 字段
 */
export const ROLE_OPTIONS: { label: string; value: string }[] = [
    { label: '管理员', value: 'ADMIN' },
    { label: '普通用户', value: 'USER' },
]

/**
 * 租户套餐选项, 对齐后端 plan 字段
 */
export const PLAN_OPTIONS: { label: string; value: string; tag: string }[] = [
    { label: '免费版', value: 'FREE', tag: 'info' },
    { label: '标准版', value: 'STANDARD', tag: 'primary' },
    { label: '企业版', value: 'ENTERPRISE', tag: 'success' },
]

/**
 * 登录方式选项, 对齐后端 loginType 字段
 */
export const LOGIN_TYPE_OPTIONS: { label: string; value: string }[] = [
    { label: '账号密码', value: 'PASSWORD' },
    { label: '刷新令牌', value: 'REFRESH_TOKEN' },
]

/**
 * 登录结果选项, 对齐后端 success 字段(1-成功 0-失败)
 */
export const LOGIN_RESULT_OPTIONS: { label: string; value: number; tag: string }[] = [
    { label: '成功', value: 1, tag: 'success' },
    { label: '失败', value: 0, tag: 'danger' },
]

/**
 * 获取启停状态的中文说明
 *
 * @param status 状态值
 * @returns 中文说明, 未匹配时返回 "未知"
 */
export function statusLabel(status?: number): string {
    const matched = STATUS_OPTIONS.find((item) => item.value === status)
    return matched ? matched.label : '未知'
}

/**
 * 获取启停状态对应的 Element Plus 标签类型
 *
 * @param status 状态值
 * @returns 标签类型, 未匹配时返回 info
 */
export function statusTagType(status?: number): string {
    const matched = STATUS_OPTIONS.find((item) => item.value === status)
    return matched ? matched.tag : 'info'
}

/**
 * 获取角色编码的中文说明
 *
 * @param role 角色编码
 * @returns 中文说明, 未匹配时返回 "未知"
 */
export function roleLabel(role?: string): string {
    const matched = ROLE_OPTIONS.find((item) => item.value === role)
    return matched ? matched.label : '未知'
}

/**
 * 获取角色编码对应的 Element Plus 标签类型
 *
 * @param role 角色编码
 * @returns 标签类型, 未匹配时返回 info
 */
export function roleTagType(role?: string): string {
    return role === ROLE_ADMIN ? 'danger' : 'primary'
}

/**
 * 获取租户套餐的中文说明
 *
 * @param plan 套餐编码
 * @returns 中文说明, 未匹配时原样返回
 */
export function planLabel(plan?: string): string {
    if (!plan) return '-'
    const matched = PLAN_OPTIONS.find((item) => item.value === plan)
    return matched ? matched.label : plan
}

/**
 * 获取租户套餐对应的 Element Plus 标签类型
 *
 * @param plan 套餐编码
 * @returns 标签类型, 未匹配时返回 info
 */
export function planTagType(plan?: string): string {
    const matched = PLAN_OPTIONS.find((item) => item.value === plan)
    return matched ? matched.tag : 'info'
}

/**
 * 获取登录方式的中文说明
 *
 * @param loginType 登录方式编码
 * @returns 中文说明, 未匹配时原样返回
 */
export function loginTypeLabel(loginType?: string): string {
    if (!loginType) return '-'
    const matched = LOGIN_TYPE_OPTIONS.find((item) => item.value === loginType)
    return matched ? matched.label : loginType
}

/**
 * 获取登录结果对应的 Element Plus 标签类型
 *
 * @param success 结果值: 1-成功 0-失败
 * @returns 标签类型, 未匹配时返回 info
 */
export function loginResultTagType(success?: number): string {
    const matched = LOGIN_RESULT_OPTIONS.find((item) => item.value === success)
    return matched ? matched.tag : 'info'
}
