import request from '../utils/request.ts'
import {Result} from '../data/result/Result.ts'
import {MultiResult} from '../data/result/MultiResult.ts'
import {UserVO} from '../data/system/UserVO.ts'
import {UserQuery} from '../data/system/UserQuery.ts'
import {UserForm} from '../data/system/UserForm.ts'

/**
 * 分页查询用户列表
 *
 * @param query 分页与筛选参数
 * @returns Promise 对象, 包含用户分页列表
 */
export function fetchUserPage(query: UserQuery): Promise<MultiResult<UserVO>> {
    return request.post('/api/system/user/page', query)
}

/**
 * 查询用户详情
 *
 * @param id 用户 ID
 * @returns Promise 对象, 包含用户详情
 */
export function fetchUserDetail(id: number): Promise<Result<UserVO>> {
    return request.get(`/api/system/user/${id}`)
}

/**
 * 新增用户
 *
 * @param data 用户表单参数
 * @returns Promise 对象, 数据为新增用户 ID
 */
export function createUser(data: UserForm): Promise<Result<number>> {
    return request.post('/api/system/user', data)
}

/**
 * 修改用户资料
 *
 * @param data 用户表单参数, 必须携带用户 ID
 * @returns Promise 对象
 */
export function updateUser(data: UserForm): Promise<Result<void>> {
    return request.put('/api/system/user', data)
}

/**
 * 逻辑删除用户
 *
 * @param id 用户 ID
 * @returns Promise 对象
 */
export function deleteUser(id: number): Promise<Result<void>> {
    return request.delete(`/api/system/user/${id}`)
}

/**
 * 重置用户密码
 *
 * @param id          用户 ID
 * @param newPassword 新密码明文
 * @returns Promise 对象
 */
export function resetUserPassword(id: number, newPassword: string): Promise<Result<void>> {
    return request.put(`/api/system/user/${id}/password`, {newPassword})
}

/**
 * 启用或禁用用户
 *
 * @param id     用户 ID
 * @param status 目标状态: 1-正常 0-禁用
 * @returns Promise 对象
 */
export function changeUserStatus(id: number, status: number): Promise<Result<void>> {
    return request.put(`/api/system/user/${id}/status`, null, {params: {status}})
}
