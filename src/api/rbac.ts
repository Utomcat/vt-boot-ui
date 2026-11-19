import request from '../utils/request.ts'
import {Result} from '../data/result/Result.ts'
import {MultiResult} from '../data/result/MultiResult.ts'
import {UserMenuVO} from '../data/rbac/UserMenuVO.ts'
import {MenuVO} from '../data/rbac/MenuVO.ts'
import {MenuForm} from '../data/rbac/MenuForm.ts'
import {RoleVO} from '../data/rbac/RoleVO.ts'
import {RoleForm} from '../data/rbac/RoleForm.ts'
import {RoleQuery} from '../data/rbac/RoleQuery.ts'

/**
 * 查询当前登录用户的角色、权限与可见菜单树
 *
 * @returns Promise 对象, 包含角色、权限码与菜单树
 */
export function fetchMyMenus(): Promise<Result<UserMenuVO>> {
    return request.get('/api/auth/menus')
}

/**
 * 分页查询角色列表
 *
 * @param query 分页与筛选参数
 * @returns Promise 对象, 包含角色分页列表
 */
export function fetchRolePage(query: RoleQuery): Promise<MultiResult<RoleVO>> {
    return request.post('/api/system/role/page', query)
}

/**
 * 查询角色详情(含已授权菜单 ID)
 *
 * @param id 角色 ID
 * @returns Promise 对象, 包含角色详情
 */
export function fetchRoleDetail(id: number): Promise<Result<RoleVO>> {
    return request.get(`/api/system/role/${id}`)
}

/**
 * 查询全部启用角色的精简列表, 供用户管理分配角色时选择
 *
 * @returns Promise 对象, 包含角色列表
 */
export function fetchRoleOptions(): Promise<Result<RoleVO[]>> {
    return request.get('/api/system/role/options')
}

/**
 * 新增角色
 *
 * @param data 角色表单参数
 * @returns Promise 对象, 数据为新增角色 ID
 */
export function createRole(data: RoleForm): Promise<Result<number>> {
    return request.post('/api/system/role', data)
}

/**
 * 修改角色
 *
 * @param data 角色表单参数, 必须携带角色 ID
 * @returns Promise 对象
 */
export function updateRole(data: RoleForm): Promise<Result<void>> {
    return request.put('/api/system/role', data)
}

/**
 * 逻辑删除角色
 *
 * @param id 角色 ID
 * @returns Promise 对象
 */
export function deleteRole(id: number): Promise<Result<void>> {
    return request.delete(`/api/system/role/${id}`)
}

/**
 * 启用或禁用角色
 *
 * @param id     角色 ID
 * @param status 目标状态: 1-正常 0-禁用
 * @returns Promise 对象
 */
export function changeRoleStatus(id: number, status: number): Promise<Result<void>> {
    return request.put(`/api/system/role/${id}/status`, null, {params: {status}})
}

/**
 * 查询全部菜单树(含按钮), 供菜单管理与角色授权共用
 *
 * @returns Promise 对象, 包含菜单树
 */
export function fetchMenuTree(): Promise<Result<MenuVO[]>> {
    return request.get('/api/system/menu/tree')
}

/**
 * 新增菜单
 *
 * @param data 菜单表单参数
 * @returns Promise 对象, 数据为新增菜单 ID
 */
export function createMenu(data: MenuForm): Promise<Result<number>> {
    return request.post('/api/system/menu', data)
}

/**
 * 修改菜单
 *
 * @param data 菜单表单参数, 必须携带菜单 ID
 * @returns Promise 对象
 */
export function updateMenu(data: MenuForm): Promise<Result<void>> {
    return request.put('/api/system/menu', data)
}

/**
 * 逻辑删除菜单
 *
 * @param id 菜单 ID
 * @returns Promise 对象
 */
export function deleteMenu(id: number): Promise<Result<void>> {
    return request.delete(`/api/system/menu/${id}`)
}
