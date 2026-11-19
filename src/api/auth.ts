import request from '../utils/request.ts'
import {Result} from '../data/result/Result.ts'
import {LoginDTO} from '../data/auth/LoginDTO.ts'
import {LoginVO} from '../data/auth/LoginVO.ts'
import {UserInfoVO} from '../data/auth/UserInfoVO.ts'
import {RefreshTokenDTO} from '../data/auth/RefreshTokenDTO.ts'

/**
 * 账号密码登录
 *
 * @param data 登录参数, 含用户名、密码与可选设备信息
 * @returns Promise 对象, 包含访问令牌、刷新令牌与用户基本信息
 */
export function login(data: LoginDTO): Promise<Result<LoginVO>> {
    return request.post('/api/auth/login', data)
}

/**
 * 使用刷新令牌换取新的访问令牌
 *
 * @param data 刷新令牌参数
 * @returns Promise 对象, 包含新的访问令牌与刷新令牌
 */
export function refreshToken(data: RefreshTokenDTO): Promise<Result<LoginVO>> {
    return request.post('/api/auth/refresh', data)
}

/**
 * 退出登录, 注销当前会话并撤销该用户全部刷新令牌
 *
 * @returns Promise 对象
 */
export function logout(): Promise<Result<void>> {
    return request.post('/api/auth/logout')
}

/**
 * 查询当前登录用户信息
 *
 * @returns Promise 对象, 包含当前登录用户资料
 */
export function fetchCurrentUser(): Promise<Result<UserInfoVO>> {
    return request.get('/api/auth/me')
}
