/**
 * 租户信息接口(对齐后端 TenantVO)
 */
export interface TenantVO {
    // 租户 ID
    id: number
    // 租户名称
    name: string
    // 租户编码(唯一标识)
    code: string
    // 联系人
    contactName?: string
    // 联系邮箱
    contactEmail?: string
    // 套餐: FREE / STANDARD / ENTERPRISE
    plan?: string
    // 最大用户数
    maxUsers?: number
    // 最大存储空间(MB)
    maxStorageMb?: number
    // 每日 Token 上限
    maxDailyTokens?: number
    // 状态: 1-正常 0-禁用
    status?: number
    // 到期时间, 兼容后端返回 ISO 字符串 / 空格分隔字符串 / Jackson 数组
    expireTime?: string | number[] | number
    // 创建时间
    createTime?: string
    // 管理员备注
    remark?: string
}
