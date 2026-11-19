/**
 * 用户新增/修改参数接口(对齐后端 UserFormPO)
 */
export interface UserForm {
    // 用户 ID, 新增时为空, 修改时必填
    id?: number
    // 登录名, 新增时必填
    username?: string
    // 密码, 仅新增时使用; 修改用户不提交密码, 统一走重置密码接口
    password?: string
    // 真实姓名
    realName?: string
    // 邮箱
    email?: string
    // 手机号
    phone?: string
    // 角色 ID 集合, 一个用户可拥有多个角色, 为空时使用默认角色
    roleIds?: number[]
    // 状态: 1-正常 0-禁用
    status?: number
    // 管理员备注
    remark?: string
}
