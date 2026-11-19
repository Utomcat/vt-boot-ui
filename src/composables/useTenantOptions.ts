import { ref } from 'vue'
import { fetchTenantOptions } from '../api/tenant'
import { TenantVO } from '../data/system/TenantVO'

/**
 * 租户选项进程内缓存 - 多个页面共享, 避免重复请求
 */
let cachedOptions: TenantVO[] | null = null

/**
 * 正在进行的租户选项请求 - 用于合并并发请求
 */
let pendingRequest: Promise<TenantVO[]> | null = null

/**
 * 加载全部启用租户选项(带缓存)
 *
 * @param force 是否强制刷新缓存
 * @returns 租户选项列表
 */
export function loadTenantOptions(force = false): Promise<TenantVO[]> {
  if (!force) {
    if (cachedOptions) {
      return Promise.resolve(cachedOptions)
    }
    if (pendingRequest) {
      return pendingRequest
    }
  }
  pendingRequest = fetchTenantOptions()
    .then((res) => {
      const list = res.data || []
      cachedOptions = list
      return list
    })
    .finally(() => {
      pendingRequest = null
    })
  return pendingRequest
}

/**
 * 根据租户 ID 解析租户展示名称
 *
 * @param tenantId 租户 ID, 为空表示任务未限制所属租户
 * @param options  已加载的租户选项列表
 * @returns 租户名称; 未指定租户返回「全部租户」, 找不到时回退为「租户 #ID」
 */
export function resolveTenantName(
  tenantId: string | number | null | undefined,
  options: TenantVO[],
): string {
  const id = tenantId === null || tenantId === undefined ? '' : String(tenantId).trim()
  if (!id) {
    return '全部租户'
  }
  const matched = options.find((item) => String(item.id) === id)
  return matched ? matched.name : `租户 #${id}`
}

/**
 * 租户选项组合式函数 - 提供响应式租户选项列表与名称解析能力
 */
export function useTenantOptions() {
  // 已加载的租户选项列表
  const tenantOptions = ref<TenantVO[]>([])

  /**
   * 确保租户选项已加载, 加载失败时降级为空列表(租户名称回退为 ID)
   *
   * @param force 是否强制刷新缓存
   * @returns 租户选项列表
   */
  const ensureLoaded = async (force = false): Promise<TenantVO[]> => {
    try {
      tenantOptions.value = await loadTenantOptions(force)
    } catch {
      tenantOptions.value = cachedOptions || []
    }
    return tenantOptions.value
  }

  /**
   * 解析租户展示名称
   *
   * @param tenantId 租户 ID
   * @returns 租户名称
   */
  const tenantName = (tenantId: string | number | null | undefined): string =>
    resolveTenantName(tenantId, tenantOptions.value)

  return { tenantOptions, ensureLoaded, tenantName }
}
