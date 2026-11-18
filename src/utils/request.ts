import axios from 'axios'
import {ElMessage} from 'element-plus'
import {isSuccess, Result} from '../data/result/Result'
import {MultiResult} from '../data/result/MultiResult'

/**
 * Axios 实例: 开发环境通过 Vite 代理访问后端, 生产环境同源部署
 */
const request = axios.create({
    baseURL: '',
    timeout: 30000,
})

/**
 * 响应拦截器: 校验统一响应结构 Result/MultiResult 后返回响应体
 */
request.interceptors.response.use(
    (res) => {
        const result: Result | MultiResult = res.data
        if (isSuccess(result)) {
            return res.data
        }
        const errorMsg = result.msg || '请求失败'
        ElMessage.error(errorMsg)
        return Promise.reject(new Error(errorMsg))
    },
    (err) => {
        const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
        if (isTimeout) {
            ElMessage.error('请求超时, 请稍后重试或检查后端服务是否正常运行')
        } else {
            ElMessage.error(err.response?.data?.msg || err.message || '网络错误')
        }
        return Promise.reject(err)
    }
)

export default request
