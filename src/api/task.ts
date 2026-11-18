import request from '../utils/request.ts'
import {buildPageQuery} from '../data/page/PageParams.ts'
import {Result} from '../data/result/Result.ts'
import {MultiResult} from '../data/result/MultiResult.ts'
import {VtJob} from '../data/task/VtJob.ts'
import {VtJobSaveDTO} from '../data/task/VtJobSaveDTO.ts'
import {VtJobLog} from '../data/task/VtJobLog.ts'

/**
 * 分页查询任务列表
 *
 * @param params 查询参数对象, 含 page / size / condition(name, group)
 * @returns Promise 对象, 包含任务分页列表
 */
export function fetchJobPage(params: Record<string, any>): Promise<MultiResult<VtJob>> {
    const flatParams = buildPageQuery({
        page: params.page,
        size: params.size,
        condition: params.condition,
    })
    return request.get('/api/task/list', {params: flatParams})
}

/**
 * 查询任务详情
 *
 * @param group 任务分组, 可为空
 * @param name  任务名称
 * @returns Promise 对象, 包含任务详情
 */
export function fetchJobDetail(group: string | undefined, name: string): Promise<Result<VtJob>> {
    return request.get('/api/task/detail', {params: {group: group || undefined, name}})
}

/**
 * 新增任务
 *
 * @param data 任务保存参数
 * @returns Promise 对象
 */
export function createJob(data: VtJobSaveDTO): Promise<Result<void>> {
    return request.post('/api/task/create', data)
}

/**
 * 修改任务
 *
 * @param data 任务保存参数
 * @returns Promise 对象
 */
export function updateJob(data: VtJobSaveDTO): Promise<Result<void>> {
    return request.put('/api/task/update', data)
}

/**
 * 暂停任务
 *
 * @param group 任务分组, 可为空
 * @param name  任务名称
 * @returns Promise 对象
 */
export function pauseJob(group: string | undefined, name: string): Promise<Result<void>> {
    return request.put('/api/task/pause', null, {params: {group: group || undefined, name}})
}

/**
 * 恢复任务
 *
 * @param group 任务分组, 可为空
 * @param name  任务名称
 * @returns Promise 对象
 */
export function resumeJob(group: string | undefined, name: string): Promise<Result<void>> {
    return request.put('/api/task/resume', null, {params: {group: group || undefined, name}})
}

/**
 * 立即执行一次任务
 *
 * @param group 任务分组, 可为空
 * @param name  任务名称
 * @returns Promise 对象
 */
export function triggerJob(group: string | undefined, name: string): Promise<Result<void>> {
    return request.put('/api/task/trigger', null, {params: {group: group || undefined, name}})
}

/**
 * 删除任务
 *
 * @param group 任务分组, 可为空
 * @param name  任务名称
 * @returns Promise 对象
 */
export function deleteJob(group: string | undefined, name: string): Promise<Result<void>> {
    return request.delete('/api/task/delete', {params: {group: group || undefined, name}})
}

/**
 * 分页查询任务执行日志
 *
 * @param params 查询参数对象, 含 page / size / condition(jobName, status, from, to)
 * @returns Promise 对象, 包含执行日志分页列表
 */
export function fetchJobLogPage(params: Record<string, any>): Promise<MultiResult<VtJobLog>> {
    const flatParams = buildPageQuery({
        page: params.page,
        size: params.size,
        condition: params.condition,
    })
    return request.get('/api/task/log/list', {params: flatParams})
}

/**
 * 查询执行日志详情
 *
 * @param id 日志主键
 * @returns Promise 对象, 包含日志详情
 */
export function fetchJobLogDetail(id: number): Promise<Result<VtJobLog>> {
    return request.get(`/api/task/log/detail/${id}`)
}

/**
 * 统计各状态日志数量
 *
 * @returns Promise 对象, 数据为 状态名 -> 数量
 */
export function fetchJobLogSummary(): Promise<Result<Record<string, number>>> {
    return request.get('/api/task/log/summary')
}

/**
 * 按保留天数清理历史日志
 *
 * @param days 保留天数, 不传时后端默认 30 天
 * @returns Promise 对象, 数据为清理条数
 */
export function cleanJobLog(days?: number): Promise<Result<number>> {
    return request.delete('/api/task/log/clean', {params: {days: days || undefined}})
}
