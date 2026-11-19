/**
 * 当前登录用户信息接口(对齐后端 UserInfoVO)
 */
export interface UserInfoVO {
    // 用户 ID
    userId: number
    // 登录名
    username: string
    // 真实姓名
    realName?: string
    // 角色: ADMIN / USER
    role?: string
    // 租户 ID
    tenantId?: number | string
    // 租户名称
    tenantName?: string
    // 邮箱
    email?: string
    // 手机号
    phone?: string
    // 头像
    avatar?: string
}
