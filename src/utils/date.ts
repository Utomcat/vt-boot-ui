/**
 * 将后端返回的时间值转换为 Date 对象, 兼容字符串、时间戳与 Jackson 数组形态
 *
 * @param val 时间值
 * @returns Date 对象, 无法解析时返回 null
 */
function toDate(val: any): Date | null {
    if (val === undefined || val === null || val === '') return null
    if (val instanceof Date) return val
    if (Array.isArray(val)) {
        const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = val
        const d = new Date(year, month - 1, day, hour, minute, second)
        return Number.isNaN(d.getTime()) ? null : d
    }
    const d = typeof val === 'string' ? new Date(val.replace(' ', 'T')) : new Date(val)
    return Number.isNaN(d.getTime()) ? null : d
}

/**
 * 格式化为 YYYY-MM-DD HH:mm:ss
 *
 * @param val 时间值
 * @returns 格式化后的时间字符串, 无法解析时原样返回
 */
export function formatDateTime(val: any): string {
    if (val === undefined || val === null || val === '') return ''
    const d = toDate(val)
    if (!d) return String(val)
    const p = (n: any) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/**
 * 格式化为 YYYY-MM-DD
 *
 * @param val 时间值
 * @returns 格式化后的日期字符串, 无法解析时原样返回
 */
export function formatDate(val: any): string {
    if (val === undefined || val === null || val === '') return ''
    const d = toDate(val)
    if (!d) return String(val).slice(0, 10)
    const p = (n: any) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * 归一化为后端可解析的日期时间字符串 YYYY-MM-DDTHH:mm:ss
 *
 * 用于表单回填场景: 无论后端返回 ISO 字符串、空格分隔字符串、Jackson 数组还是时间戳,
 * 都能转换为 el-date-picker 可识别的值。
 *
 * @param val 时间值
 * @returns 归一化后的字符串, 无法解析时返回 undefined
 */
export function toDateTimeString(val: any): string | undefined {
    if (val === undefined || val === null || val === '') return undefined
    const d = toDate(val)
    if (!d) return undefined
    const p = (n: any) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/**
 * 毫秒耗时格式化为可读文本(小于 1000ms 展示毫秒, 否则展示秒)
 *
 * @param ms 耗时毫秒数
 * @returns 可读耗时文本
 */
export function formatDuration(ms?: number | null): string {
    if (ms === undefined || ms === null) return '-'
    if (ms < 1000) return `${ms} ms`
    return `${(ms / 1000).toFixed(3)} s`
}
