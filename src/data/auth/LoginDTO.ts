/**
 * 登录请求参数接口(对齐后端 LoginPO)
 */
export interface LoginDTO {
    // 登录名
    username: string
    // 密码(明文传输, 由后端加盐校验)
    password: string
    // 设备信息(浏览器标识), 可空
    deviceInfo?: string
}
