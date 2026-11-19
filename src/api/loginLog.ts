import request from '../utils/request.ts'
import {MultiResult} from '../data/result/MultiResult.ts'
import {LoginLogVO} from '../data/system/LoginLogVO.ts'
import {LoginLogQuery} from '../data/system/LoginLogQuery.ts'

/**
 * 分页查询登录审计日志
 *
 * @param query 分页与筛选参数
 * @returns Promise 对象, 包含登录日志分页列表
 */
export function fetchLoginLogPage(query: LoginLogQuery): Promise<MultiResult<LoginLogVO>> {
    return request.post('/api/system/login-log/page', query)
}
