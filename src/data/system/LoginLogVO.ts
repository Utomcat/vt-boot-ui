/**
 * 登录日志信息接口(对齐后端 LoginLogVO)
 */
export interface LoginLogVO {
    // 主键
    id: number
    // 用户 ID
    userId?: number
    // 登录名
    username?: string
    // 登录方式: PASSWORD / REFRESH_TOKEN
    loginType?: string
    // 是否成功: 0-失败 1-成功
    success?: number
    // 失败原因
    failReason?: string
    // 客户端 IP
    ip?: string
    // 设备信息
    deviceInfo?: string
    // 登录时间
    createTime?: string
}
