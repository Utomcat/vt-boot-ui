import request from '../utils/request.ts'
import {Result} from '../data/result/Result.ts'
import {MultiResult} from '../data/result/MultiResult.ts'
import {DictTypeVO} from '../data/dict/DictTypeVO.ts'
import {DictTypeQuery} from '../data/dict/DictTypeQuery.ts'
import {DictTypeForm} from '../data/dict/DictTypeForm.ts'
import {DictDataVO} from '../data/dict/DictDataVO.ts'
import {DictDataQuery} from '../data/dict/DictDataQuery.ts'
import {DictDataForm} from '../data/dict/DictDataForm.ts'

// ---------------------------------------------------------------------------
// 字典类型
// ---------------------------------------------------------------------------

/**
 * 分页查询字典类型列表
 *
 * @param query 分页与筛选参数
 * @returns Promise 对象, 包含字典类型分页列表
 */
export function fetchDictTypePage(query: DictTypeQuery): Promise<MultiResult<DictTypeVO>> {
    return request.post('/api/system/dict/type/page', query)
}

/**
 * 查询全部启用字典类型的精简列表(供字典数据页面选择所属类型)
 *
 * @returns Promise 对象, 包含字典类型列表
 */
export function fetchDictTypeOptions(): Promise<Result<DictTypeVO[]>> {
    return request.get('/api/system/dict/type/options')
}

/**
 * 查询字典类型详情
 *
 * @param id 字典类型 ID
 * @returns Promise 对象, 包含字典类型详情
 */
export function fetchDictTypeDetail(id: number): Promise<Result<DictTypeVO>> {
    return request.get(`/api/system/dict/type/${id}`)
}

/**
 * 新增字典类型
 *
 * @param data 字典类型表单参数
 * @returns Promise 对象, 数据为新增字典类型 ID
 */
export function createDictType(data: DictTypeForm): Promise<Result<number>> {
    return request.post('/api/system/dict/type', data)
}

/**
 * 修改字典类型
 *
 * @param data 字典类型表单参数, 必须携带 ID
 * @returns Promise 对象
 */
export function updateDictType(data: DictTypeForm): Promise<Result<void>> {
    return request.put('/api/system/dict/type', data)
}

/**
 * 逻辑删除字典类型
 *
 * @param id 字典类型 ID
 * @returns Promise 对象
 */
export function deleteDictType(id: number): Promise<Result<void>> {
    return request.delete(`/api/system/dict/type/${id}`)
}

/**
 * 启用或禁用字典类型
 *
 * @param id     字典类型 ID
 * @param status 目标状态: 1-正常 0-禁用
 * @returns Promise 对象
 */
export function changeDictTypeStatus(id: number, status: number): Promise<Result<void>> {
    return request.put(`/api/system/dict/type/${id}/status`, null, {params: {status}})
}

// ---------------------------------------------------------------------------
// 字典数据
// ---------------------------------------------------------------------------

/**
 * 分页查询字典数据列表
 *
 * @param query 分页与筛选参数
 * @returns Promise 对象, 包含字典数据分页列表
 */
export function fetchDictDataPage(query: DictDataQuery): Promise<MultiResult<DictDataVO>> {
    return request.post('/api/system/dict/data/page', query)
}

/**
 * 按字典类型编码查询全部启用的字典数据(业务读取字典的标准入口, 当前无缓存)
 *
 * @param dictType 字典类型编码
 * @returns Promise 对象, 包含字典数据列表
 */
export function fetchDictDataByType(dictType: string): Promise<Result<DictDataVO[]>> {
    return request.get(`/api/system/dict/data/type/${dictType}`)
}

/**
 * 查询字典数据详情
 *
 * @param id 字典数据 ID
 * @returns Promise 对象, 包含字典数据详情
 */
export function fetchDictDataDetail(id: number): Promise<Result<DictDataVO>> {
    return request.get(`/api/system/dict/data/${id}`)
}

/**
 * 新增字典数据
 *
 * @param data 字典数据表单参数
 * @returns Promise 对象, 数据为新增字典数据 ID
 */
export function createDictData(data: DictDataForm): Promise<Result<number>> {
    return request.post('/api/system/dict/data', data)
}

/**
 * 修改字典数据
 *
 * @param data 字典数据表单参数, 必须携带 ID
 * @returns Promise 对象
 */
export function updateDictData(data: DictDataForm): Promise<Result<void>> {
    return request.put('/api/system/dict/data', data)
}

/**
 * 逻辑删除字典数据
 *
 * @param id 字典数据 ID
 * @returns Promise 对象
 */
export function deleteDictData(id: number): Promise<Result<void>> {
    return request.delete(`/api/system/dict/data/${id}`)
}

/**
 * 启用或禁用字典数据
 *
 * @param id     字典数据 ID
 * @param status 目标状态: 1-正常 0-禁用
 * @returns Promise 对象
 */
export function changeDictDataStatus(id: number, status: number): Promise<Result<void>> {
    return request.put(`/api/system/dict/data/${id}/status`, null, {params: {status}})
}
