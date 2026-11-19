/**
 * 字典数据分页查询参数接口(对齐后端 DictDataQueryPO)
 */
export interface DictDataQuery {
    // 当前页码, 默认 1
    page: number
    // 每页条数, 默认 10
    size: number
    // 所属字典类型编码, 精确匹配
    dictType?: string
    // 字典标签, 模糊匹配
    dictLabel?: string
    // 状态: 1-正常 0-禁用
    status?: number
}
