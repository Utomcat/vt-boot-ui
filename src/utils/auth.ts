/**
 * 登录凭证本地存储工具
 *
 * 统一管理访问令牌、刷新令牌与当前用户缓存, 视图层与状态层只通过本模块读写凭证,
 * 避免各处直接操作 localStorage 造成键名不一致。
 */

/** 访问令牌存储键 */
const TOKEN_KEY = 'vt-boot:token'
/** 刷新令牌存储键 */
const REFRESH_TOKEN_KEY = 'vt-boot:refresh-token'
/** 当前用户缓存键 */
const USER_KEY = 'vt-boot:user'

/**
 * 本地缓存的当前用户信息(登录成功后写入, 刷新页面时用于首屏渲染)
 */
export interface CachedUser {
    // 用户 ID
    userId: number
    // 登录名
    username: string
    // 真实姓名
    realName?: string
    // 角色: ADMIN / USER
    role?: string
    // 租户 ID
    tenantId?: number | string
    // 邮箱
    email?: string
    // 手机号
    phone?: string
    // 头像
    avatar?: string
}

/**
 * 读取访问令牌
 *
 * @returns 访问令牌, 不存在时返回空字符串
 */
export function getToken(): string {
    return localStorage.getItem(TOKEN_KEY) || ''
}

/**
 * 写入访问令牌
 *
 * @param token 访问令牌
 */
export function setToken(token: string): void {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
    }
}

/**
 * 读取刷新令牌
 *
 * @returns 刷新令牌, 不存在时返回空字符串
 */
export function getRefreshToken(): string {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || ''
}

/**
 * 写入刷新令牌
 *
 * @param token 刷新令牌
 */
export function setRefreshToken(token: string): void {
    if (token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token)
    }
}

/**
 * 读取本地缓存的当前用户
 *
 * @returns 用户信息, 不存在或解析失败时返回 null
 */
export function getCachedUser(): CachedUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as CachedUser
    } catch {
        return null
    }
}

/**
 * 缓存当前用户
 *
 * @param user 用户信息, 传 null 表示清除缓存
 */
export function setCachedUser(user: CachedUser | null): void {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
        localStorage.removeItem(USER_KEY)
    }
}

/**
 * 清除全部登录凭证(令牌、刷新令牌与用户缓存)
 */
export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}
