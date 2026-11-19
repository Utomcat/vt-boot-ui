/**
 * 用户分页查询参数接口(对齐后端 UserQueryPO)
 */
export interface UserQuery {
    // 当前页码, 默认 1
    page: number
    // 每页条数, 默认 10
    size: number
    // 登录名, 模糊匹配
    username?: string
    // 状态: 1-正常 0-禁用
    status?: number
    // 角色: ADMIN / USER
    role?: string
}
