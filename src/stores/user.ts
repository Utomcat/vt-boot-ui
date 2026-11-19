import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import {fetchCurrentUser, login as loginApi, logout as logoutApi} from '../api/auth.ts'
import {fetchMyMenus} from '../api/rbac.ts'
import {LoginDTO} from '../data/auth/LoginDTO.ts'
import {LoginVO} from '../data/auth/LoginVO.ts'
import {UserInfoVO} from '../data/auth/UserInfoVO.ts'
import {ROLE_ADMIN} from '../data/system/SystemConstants.ts'
import {MenuItem, MENU, buildMenuFromBackend, filterMenu} from '../router/menu.ts'
import {
    CachedUser,
    clearAuth,
    getCachedUser,
    getToken,
    setCachedUser,
    setRefreshToken,
    setToken,
} from '../utils/auth.ts'

/**
 * 当前登录用户状态管理
 *
 * 负责登录、退出、用户信息加载、角色与权限判定, 以及后端菜单到侧边栏菜单的转换。
 */
export const useUserStore = defineStore('user', () => {
    // 访问令牌(初始化时从本地缓存恢复, 保证刷新页面后仍保持登录态)
    const token = ref<string>(getToken())
    // 当前登录用户信息
    const user = ref<UserInfoVO | null>(getCachedUser() as UserInfoVO | null)
    // 角色编码集合(来自后端 RBAC 解析)
    const roles = ref<string[]>([])
    // 权限码集合, 超级管理员为 ["*"]
    const permissions = ref<string[]>([])
    // 侧边栏菜单(来自后端菜单树)
    const menus = ref<MenuItem[]>([])
    // 菜单与权限是否已加载完成
    const menusReady = ref<boolean>(false)

    // 是否已登录
    const isLogin = computed<boolean>(() => Boolean(token.value))
    // 是否管理员: 优先使用 RBAC 角色, 回退到用户表中的 role 字段
    const isAdmin = computed<boolean>(() => roles.value.includes(ROLE_ADMIN) || user.value?.role === ROLE_ADMIN)
    // 展示名称: 优先真实姓名, 其次登录名
    const displayName = computed<string>(() => user.value?.realName || user.value?.username || '未登录')
    // 角色展示名称
    const roleName = computed<string>(() => (isAdmin.value ? '管理员' : '普通用户'))

    /**
     * 判断当前用户是否具备指定权限码
     *
     * @param code 权限码, 为空时视为无需权限
     * @returns 是否具备权限
     */
    function hasPerm(code?: string): boolean {
        if (!code) return true
        if (permissions.value.includes('*')) return true
        return permissions.value.includes(code)
    }

    /**
     * 账号密码登录, 成功后写入令牌与用户信息
     *
     * @param payload 登录参数
     * @returns 登录返回结果
     */
    async function login(payload: LoginDTO): Promise<LoginVO> {
        const res = await loginApi(payload)
        const data = res.data
        token.value = data.token
        setToken(data.token)
        if (data.refreshToken) {
            setRefreshToken(data.refreshToken)
        }
        const info: UserInfoVO = {
            userId: data.userId,
            username: data.username,
            realName: data.realName,
            role: data.role,
            tenantId: data.tenantId,
        }
        user.value = info
        roles.value = data.role ? [data.role] : []
        setCachedUser(info as CachedUser)
        menusReady.value = false
        return data
    }

    /**
     * 拉取当前登录用户的最新资料, 用于刷新页面或登录后补齐信息
     *
     * @returns 用户信息, 未登录时返回 null
     */
    async function loadUserInfo(): Promise<UserInfoVO | null> {
        if (!token.value) return null
        const res = await fetchCurrentUser()
        user.value = res.data
        setCachedUser(res.data as CachedUser)
        return res.data
    }

    /**
     * 拉取当前用户的角色、权限与菜单树
     */
    async function loadUserMenus(): Promise<void> {
        const res = await fetchMyMenus()
        const data = res.data
        roles.value = data?.roles || []
        permissions.value = data?.permissions || []
        const fromBackend = buildMenuFromBackend(data?.menus || [])
        menus.value = fromBackend.length ? fromBackend : filterMenu(MENU, isAdmin.value)
        menusReady.value = true
    }

    /**
     * 后端菜单接口异常时, 退化为本地兜底菜单
     */
    function useFallbackMenus(): void {
        menus.value = filterMenu(MENU, isAdmin.value)
        menusReady.value = true
    }

    /**
     * 退出登录: 先通知后端注销会话, 再清理本地凭证(后端异常不影响本地清理)
     */
    async function logout(): Promise<void> {
        try {
            if (token.value) {
                await logoutApi()
            }
        } catch {
            // 退出接口异常不阻塞本地登出
        } finally {
            reset()
        }
    }

    /**
     * 仅清理本地登录状态, 用于令牌失效或退出登录场景
     */
    function reset(): void {
        token.value = ''
        user.value = null
        roles.value = []
        permissions.value = []
        menus.value = []
        menusReady.value = false
        clearAuth()
        // 延迟清理动态路由, 避免与路由模块形成循环依赖
        import('../router/index.ts')
            .then((module) => module.resetDynamicRoutes())
            .catch(() => undefined)
    }

    return {
        token,
        user,
        roles,
        permissions,
        menus,
        menusReady,
        isLogin,
        isAdmin,
        displayName,
        roleName,
        hasPerm,
        login,
        loadUserInfo,
        loadUserMenus,
        useFallbackMenus,
        logout,
        reset,
    }
})
