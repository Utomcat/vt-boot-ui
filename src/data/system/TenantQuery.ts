/**
 * 租户分页查询参数接口(对齐后端 TenantQueryPO)
 */
export interface TenantQuery {
    // 当前页码, 默认 1
    page: number
    // 每页条数, 默认 10
    size: number
    // 租户名称, 模糊匹配
    name?: string
    // 租户编码, 模糊匹配
    code?: string
    // 套餐: FREE / STANDARD / ENTERPRISE
    plan?: string
    // 状态: 1-正常 0-禁用
    status?: number
}
