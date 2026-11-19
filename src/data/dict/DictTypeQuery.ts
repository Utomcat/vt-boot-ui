/**
 * 字典类型分页查询参数接口(对齐后端 DictTypeQueryPO)
 */
export interface DictTypeQuery {
    // 当前页码, 默认 1
    page: number
    // 每页条数, 默认 10
    size: number
    // 字典名称, 模糊匹配
    dictName?: string
    // 字典类型编码, 模糊匹配
    dictType?: string
    // 状态: 1-正常 0-禁用
    status?: number
}
