/**
 * 登录成功返回结果接口(对齐后端 LoginVO)
 */
export interface LoginVO {
    // 访问令牌
    token: string
    // 令牌请求头名称, 后端为 Authorization
    tokenName?: string
    // 刷新令牌
    refreshToken?: string
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
}
