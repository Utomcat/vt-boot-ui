/**
 * 角色分页查询参数(对齐后端 RoleQueryPO)
 */
export interface RoleQuery {
    // 当前页码
    page: number
    // 每页条数
    size: number
    // 角色名称, 模糊匹配
    name?: string
    // 角色编码, 模糊匹配
    code?: string
    // 状态: 1-正常 0-禁用
    status?: number
}
