/**
 * 登录日志分页查询参数接口(对齐后端 LoginLogQueryPO)
 */
export interface LoginLogQuery {
    // 当前页码, 默认 1
    page: number
    // 每页条数, 默认 10
    size: number
    // 登录名, 模糊匹配
    username?: string
    // 是否成功: 0-失败 1-成功
    success?: number
}
