import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios'
import {ElMessage} from 'element-plus'
import {isSuccess, Result} from '../data/result/Result.ts'
import {MultiResult} from '../data/result/MultiResult.ts'
import {clearAuth, getRefreshToken, getToken, setRefreshToken, setToken} from './auth.ts'

/**
 * 无需携带令牌的接口(登录与刷新令牌), 同时用于避免刷新令牌死循环
 */
const AUTH_WHITE_LIST = ['/api/auth/login', '/api/auth/refresh']

/**
 * Axios 实例: 开发环境通过 Vite 代理访问后端, 生产环境同源部署
 */
const request = axios.create({
    baseURL: '',
    timeout: 30000,
})

/**
 * 请求拦截器: 自动携带访问令牌
 */
request.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.set('Authorization', token)
    }
    return config
})

/**
 * 响应拦截器: 校验统一响应结构 Result/MultiResult 后返回响应体,
 * 并在 401 时尝试用刷新令牌续期, 续期失败则清理登录态并跳转登录页
 */
request.interceptors.response.use(
    (res) => {
        const result: Result | MultiResult = res.data
        if (result && typeof result === 'object' && 'success' in result) {
            if (isSuccess(result)) {
                return res.data
            }
            const errorMsg = result.msg || '请求失败'
            ElMessage.error(errorMsg)
            return Promise.reject(new Error(errorMsg))
        }
        return res.data
    },
    async (err: AxiosError<Result>) => {
        const status = err.response?.status
        const config = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

        if (status === 401 && config && !config._retry && !isAuthUrl(config.url)) {
            const renewed = await tryRefreshToken()
            if (renewed) {
                config._retry = true
                return request(config)
            }
            await handleUnauthorized()
            return Promise.reject(err)
        }

        if (status === 401) {
            await handleUnauthorized()
            return Promise.reject(err)
        }

        if (status === 403) {
            ElMessage.error(err.response?.data?.msg || '无权限访问该资源')
            return Promise.reject(err)
        }

        const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
        if (isTimeout) {
            ElMessage.error('请求超时, 请稍后重试或检查后端服务是否正常运行')
        } else {
            ElMessage.error(err.response?.data?.msg || err.message || '网络错误')
        }
        return Promise.reject(err)
    }
)

/**
 * 判断请求地址是否为认证白名单接口
 *
 * @param url 请求地址
 * @returns 是否属于白名单
 */
function isAuthUrl(url?: string): boolean {
    if (!url) return false
    return AUTH_WHITE_LIST.some((item) => url.startsWith(item))
}

// 刷新令牌的进行中任务, 保证并发 401 只发起一次刷新
let refreshing: Promise<boolean> | null = null

/**
 * 使用本地刷新令牌换取新的访问令牌
 *
 * 直接使用裸 axios 发起请求, 避免与业务拦截器相互递归。
 *
 * @returns 是否刷新成功
 */
function tryRefreshToken(): Promise<boolean> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
        return Promise.resolve(false)
    }
    if (!refreshing) {
        refreshing = axios
            .post<Result<{ token: string; refreshToken?: string }>>('/api/auth/refresh', {refreshToken})
            .then((res) => {
                const body = res.data
                if (body?.success && body.data?.token) {
                    setToken(body.data.token)
                    if (body.data.refreshToken) {
                        setRefreshToken(body.data.refreshToken)
                    }
                    return true
                }
                return false
            })
            .catch(() => false)
            .finally(() => {
                refreshing = null
            })
    }
    return refreshing
}

// 登录失效跳转标记, 避免并发 401 触发多次跳转
let redirecting = false

/**
 * 登录态失效处理: 清理本地凭证并跳转登录页
 */
async function handleUnauthorized(): Promise<void> {
    clearAuth()
    if (redirecting) return
    redirecting = true
    ElMessage.error('登录状态已失效, 请重新登录')
    try {
        const [{useUserStore}, {default: router}] = await Promise.all([
            import('../stores/user.ts'),
            import('../router/index.ts'),
        ])
        useUserStore().reset()
        const current = router.currentRoute.value
        if (current.name !== 'Login') {
            await router.replace({name: 'Login', query: {redirect: current.fullPath}})
        }
    } finally {
        redirecting = false
    }
}

export default request
