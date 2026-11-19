/**
 * 系统用户信息接口(对齐后端 UserVO)
 */
export interface UserVO {
    // 用户 ID
    id: number
    // 租户 ID
    tenantId?: number | string
    // 登录名
    username: string
    // 真实姓名
    realName?: string
    // 邮箱
    email?: string
    // 手机号
    phone?: string
    // 头像
    avatar?: string
    // 主角色编码(取自 t_user.role, 兼容字段)
    role?: string
    // 角色 ID 集合
    roleIds?: number[]
    // 角色编码集合
    roleCodes?: string[]
    // 角色名称集合
    roleNames?: string[]
    // 状态: 1-正常 0-禁用
    status?: number
    // 最后登录时间
    lastLoginTime?: string
    // 最后登录 IP
    lastLoginIp?: string
    // 创建时间
    createTime?: string
    // 管理员备注
    remark?: string
}
