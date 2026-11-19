/**
 * 角色视图对象(对齐后端 RoleVO)
 */
export interface RoleVO {
    // 角色 ID
    id: number
    // 角色编码
    code: string
    // 角色名称
    name: string
    // 角色描述
    description?: string
    // 是否内置角色: 1-是 0-否
    builtin?: number
    // 排序值
    sort?: number
    // 状态: 1-正常 0-禁用
    status?: number
    // 创建时间
    createTime?: string
    // 已授权的菜单 ID 集合, 仅详情接口返回
    menuIds?: number[]
}
