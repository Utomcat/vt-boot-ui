import {createRouter, createWebHistory} from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'
import {ElMessage} from 'element-plus'
import {useUserStore} from '../stores/user.ts'
import {getToken} from '../utils/auth.ts'
import {MenuItem} from './menu.ts'
import {VIEW_COMPONENTS} from './components.ts'
import {appConfig} from '../config/app.ts'

declare module 'vue-router' {
    interface RouteMeta {
        // 页面标题, 用于顶栏面包屑与浏览器标题
        title?: string
        // 是否需要登录, 默认 true
        requiresAuth?: boolean
        // 访问该页面所需的权限码
        permission?: string
    }
}

/**
 * 静态路由: 登录页、布局骨架, 以及不进入菜单的详情页与错误页
 */
const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/auth/Login.vue'),
        meta: {title: '登录', requiresAuth: false},
    },
    {
        path: '/',
        name: 'AdminLayout',
        component: () => import('../layouts/AdminLayout.vue'),
        redirect: '/dashboard',
        children: [
            {
                path: 'task/job/detail',
                name: 'TaskJobDetail',
                component: () => import('../views/task/JobDetail.vue'),
                meta: {title: '任务详情'},
            },
            {
                path: 'task/log/detail/:id',
                name: 'TaskJobLogDetail',
                component: () => import('../views/task/JobLogDetail.vue'),
                meta: {title: '日志详情'},
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('../views/profile/Profile.vue'),
                meta: {title: '个人中心'},
            },
            {
                path: '403',
                name: 'Forbidden',
                component: () => import('../views/error/Forbidden.vue'),
                meta: {title: '无权限'},
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/error/NotFound.vue'),
        meta: {title: '页面不存在'},
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 由后端菜单动态注册的路由名称, 退出登录时按此清理
const dynamicRouteNames: string[] = []

/**
 * 由菜单路径生成稳定的路由名称
 *
 * @param path 菜单路径
 * @returns 路由名称
 */
function routeNameOf(path: string): string {
    return `Dyn${path.replace(/[^A-Za-z0-9]/g, '_')}`
}

/**
 * 递归注册菜单对应的动态路由; 目录节点仅用于分组, 不注册路由本身
 *
 * @param menus 菜单树
 */
export function registerDynamicRoutes(menus: MenuItem[]): void {
    for (const item of menus) {
        if (item.children && item.children.length) {
            registerDynamicRoutes(item.children)
        }
        if (!item.path || !item.component) continue
        const component = VIEW_COMPONENTS[item.component]
        if (!component) continue
        const name = routeNameOf(item.path)
        if (router.hasRoute(name)) continue
        router.addRoute('AdminLayout', {
            path: item.path,
            name,
            component,
            meta: {title: item.title, permission: item.permission},
        })
        dynamicRouteNames.push(name)
    }
}

/**
 * 清理全部动态注册的路由, 用于退出登录或切换账号
 */
export function resetDynamicRoutes(): void {
    for (const name of dynamicRouteNames) {
        if (router.hasRoute(name)) {
            router.removeRoute(name)
        }
    }
    dynamicRouteNames.length = 0
}

/**
 * 全局前置守卫: 登录校验 + 动态路由注册 + 页面权限校验
 */
router.beforeEach(async (to) => {
    const requiresAuth = to.meta.requiresAuth !== false
    const token = getToken()

    if (!requiresAuth) {
        // 已登录状态访问登录页时直接回工作台
        if (to.name === 'Login' && token) {
            return {path: '/dashboard'}
        }
        return true
    }

    if (!token) {
        return {name: 'Login', query: {redirect: to.fullPath}}
    }

    const userStore = useUserStore()
    if (!userStore.user) {
        try {
            await userStore.loadUserInfo()
        } catch {
            userStore.reset()
            return {name: 'Login', query: {redirect: to.fullPath}}
        }
    }

    // 首次进入时按后端返回的菜单注册路由; 接口异常时退化为本地兜底菜单
    if (!userStore.menusReady) {
        try {
            await userStore.loadUserMenus()
        } catch {
            userStore.useFallbackMenus()
        }
        registerDynamicRoutes(userStore.menus)
        if (to.name === 'NotFound') {
            // 目标页面可能刚被注册, 重新解析一次路由
            return {path: to.fullPath, replace: true}
        }
    }

    if (to.meta.permission && !userStore.hasPerm(to.meta.permission)) {
        ElMessage.warning('没有访问该页面的权限')
        return {path: '/403'}
    }

    return true
})

/**
 * 全局后置守卫: 同步浏览器标题
 */
router.afterEach((to) => {
    const base = appConfig.title
    document.title = to.meta.title ? `${to.meta.title} · ${base}` : base
})

export default router
