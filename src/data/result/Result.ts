import {MultiResult} from "./MultiResult.ts";

/**
 * 通用响应结果接口(对齐后端 Result<T>)
 *
 * @template T 数据类型
 */
export interface Result<T = any> {
    // 状态码: 成功为 "SUCCESS", 失败为业务错误码
    code: string
    // 是否成功
    success: boolean
    // 提示信息
    msg: string
    // 返回数据
    data: T
}

/**
 * 判断响应结果是否成功(后端以 success 布尔值与 code=SUCCESS 双重标识)
 *
 * @param result 响应结果对象
 * @returns 是否成功
 */
export function isSuccess(result: Result): boolean {
    return result.success === true && (result.code === 'SUCCESS' || result.code === undefined || result.code === null)
}

/**
 * 判断是否为分页结果
 *
 * @param result 响应结果对象
 * @returns 是否为分页结果
 */
export function isPageResult(result: any): result is MultiResult {
    return (
        'total' in result &&
        'page' in result &&
        'size' in result &&
        Array.isArray(result.data)
    )
}
