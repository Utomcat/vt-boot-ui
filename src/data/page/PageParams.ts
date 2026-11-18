/**
 * 基础分页参数接口
 */
export interface PageParams {
    // 当前查询的页码
    page: number | string
    // 每页的数据量
    size: number | string
    // 其它查询条件键值
    [key: string]: any
}

/**
 * 构建基础分页参数, 将分页与筛选条件展平为符合 Spring Boot 绑定的 URL 查询参数格式
 *
 * @param params 待处理的分页参数对象
 * @param params.page 当前查询的页码
 * @param params.size 每页的数据量
 * @param params.condition 查询条件数据存放对象
 * @returns 展平后的参数对象, 可直接用于 HTTP 请求的查询参数
 */
export function buildPageQuery(params: {
    page: number | string
    size: number | string
    condition?: Record<string, any>
}): PageParams {
    const flatParams: PageParams = {
        page: Number(params.page),
        size: Number(params.size),
    }
    if (params.condition) {
        const condition = params.condition
        Object.keys(condition).forEach((key) => {
            const value = condition[key]
            if (value !== undefined && value !== null && value !== '') {
                flatParams[key] = value
            }
        })
    }
    return flatParams
}
