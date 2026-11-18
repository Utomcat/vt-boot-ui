import {Result} from "./Result.ts";

/**
 * 分页列表响应结果接口(对齐后端 MultiResult<T>)
 *
 * @template T 列表项数据类型
 */
export interface MultiResult<T = any> extends Result<T[]> {
    // 总记录数
    total: number
    // 当前页码
    page: number
    // 每页记录数
    size: number
}
