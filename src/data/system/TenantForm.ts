/**
 * 租户新增/修改参数接口(对齐后端 TenantFormPO)
 */
export interface TenantForm {
    // 租户 ID, 新增时为空, 修改时必填
    id?: number
    // 租户名称
    name?: string
    // 租户编码(唯一标识), 修改时不可变更
    code?: string
    // 联系人姓名
    contactName?: string
    // 联系邮箱
    contactEmail?: string
    // 套餐: FREE / STANDARD / ENTERPRISE
    plan?: string
    // 最大用户数配额
    maxUsers?: number
    // 最大存储空间(MB)
    maxStorageMb?: number
    // 每日 Token 上限
    maxDailyTokens?: number
    // 状态: 1-正常 0-禁用
    status?: number
    // 到期时间
    expireTime?: string
    // 管理员备注
    remark?: string
}
