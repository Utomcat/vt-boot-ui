import request from '../utils/request.ts'
import {Result} from '../data/result/Result.ts'
import {MultiResult} from '../data/result/MultiResult.ts'
import {TenantVO} from '../data/system/TenantVO.ts'
import {TenantQuery} from '../data/system/TenantQuery.ts'
import {TenantForm} from '../data/system/TenantForm.ts'

/**
 * 分页查询租户列表
 *
 * @param query 分页与筛选参数
 * @returns Promise 对象, 包含租户分页列表
 */
export function fetchTenantPage(query: TenantQuery): Promise<MultiResult<TenantVO>> {
    return request.post('/api/system/tenant/page', query)
}

/**
 * 查询全部启用租户的精简列表(用于任务等业务选择所属租户)
 *
 * @returns Promise 对象, 包含租户列表
 */
export function fetchTenantOptions(): Promise<Result<TenantVO[]>> {
    return request.get('/api/system/tenant/options')
}

/**
 * 查询租户详情
 *
 * @param id 租户 ID
 * @returns Promise 对象, 包含租户详情
 */
export function fetchTenantDetail(id: number): Promise<Result<TenantVO>> {
    return request.get(`/api/system/tenant/${id}`)
}

/**
 * 新增租户
 *
 * @param data 租户表单参数
 * @returns Promise 对象, 数据为新增租户 ID
 */
export function createTenant(data: TenantForm): Promise<Result<number>> {
    return request.post('/api/system/tenant', data)
}

/**
 * 修改租户资料
 *
 * @param data 租户表单参数, 必须携带租户 ID
 * @returns Promise 对象
 */
export function updateTenant(data: TenantForm): Promise<Result<void>> {
    return request.put('/api/system/tenant', data)
}

/**
 * 逻辑删除租户
 *
 * @param id 租户 ID
 * @returns Promise 对象
 */
export function deleteTenant(id: number): Promise<Result<void>> {
    return request.delete(`/api/system/tenant/${id}`)
}

/**
 * 启用或禁用租户
 *
 * @param id     租户 ID
 * @param status 目标状态: 1-正常 0-禁用
 * @returns Promise 对象
 */
export function changeTenantStatus(id: number, status: number): Promise<Result<void>> {
    return request.put(`/api/system/tenant/${id}/status`, null, {params: {status}})
}
