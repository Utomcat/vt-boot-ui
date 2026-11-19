/**
 * 角色表单参数(对齐后端 RoleFormPO)
 */
export interface RoleForm {
    // 角色 ID, 新增时为空
    id?: number
    // 角色编码, 新增必填, 内置角色不可修改
    code: string
    // 角色名称
    name: string
    // 角色描述
    description?: string
    // 排序值
    sort?: number
    // 状态: 1-正常 0-禁用
    status?: number
    // 授权的菜单 ID 集合
    menuIds?: number[]
}
