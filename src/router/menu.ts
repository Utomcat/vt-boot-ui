import {MenuVO} from '../data/rbac/MenuVO.ts'

/**
 * 侧边栏菜单项
 */
export interface MenuItem {
    // 菜单跳转路径(与路由 path 对齐)
    path: string
    // 菜单标题
    title: string
    // 图标组件名称(Element Plus 图标, 已全局注册)
    icon: string
    // 前端组件标识, 动态路由注册时使用
    component?: string
    // 权限码, 动态路由注册时写入路由 meta
    permission?: string
    // 是否仅管理员可见(本地兜底菜单使用)
    adminOnly?: boolean
    // 子菜单
    children?: MenuItem[]
}

/**
 * 本地兜底菜单树
 *
 * 仅在 /api/auth/menus 不可用时使用, 保证后端异常时界面仍可导航。
 */
export const MENU: MenuItem[] = [
    {
        path: '/dashboard',
        title: '工作台',
        icon: 'Odometer',
        component: 'dashboard/Dashboard',
    },
    {
        path: '/system',
        title: '系统管理',
        icon: 'Setting',
        children: [
            {path: '/system/user', title: '用户管理', icon: 'User', adminOnly: true},
            {path: '/system/tenant', title: '租户管理', icon: 'OfficeBuilding', adminOnly: true},
            {path: '/system/login-log', title: '登录日志', icon: 'Document', adminOnly: true},
            {path: '/system/role', title: '角色管理', icon: 'UserFilled', adminOnly: true},
            {path: '/system/menu', title: '菜单管理', icon: 'Menu', adminOnly: true},
        ],
    },
    {
        path: '/task',
        title: '任务调度',
        icon: 'Timer',
        children: [
            {path: '/task/job', title: '任务管理', icon: 'List'},
            {path: '/task/log', title: '执行日志', icon: 'Tickets'},
        ],
    },
]

/**
 * 将后端菜单树转换为侧边栏菜单项(过滤按钮与无路径节点)
 *
 * @param nodes 后端菜单树
 * @returns 侧边栏菜单项
 */
export function buildMenuFromBackend(nodes: MenuVO[]): MenuItem[] {
    if (!Array.isArray(nodes)) return []
    const result: MenuItem[] = []
    for (const node of nodes) {
        if (!node || node.type === 'BUTTON') continue
        const children = node.children && node.children.length ? buildMenuFromBackend(node.children) : []
        const hasComponent = Boolean(node.component)
        if (!node.path && !children.length) continue
        if (!hasComponent && !children.length) continue
        result.push({
            path: node.path || '',
            title: node.name,
            icon: node.icon || 'Menu',
            component: node.component,
            permission: node.permission,
            children: children.length ? children : undefined,
        })
    }
    return result
}

/**
 * 按角色过滤本地兜底菜单树, 过滤后无子项的分组一并移除
 *
 * @param menu    菜单树
 * @param isAdmin 当前用户是否管理员
 * @returns 过滤后的菜单树
 */
export function filterMenu(menu: MenuItem[], isAdmin: boolean): MenuItem[] {
    return menu
        .filter((item) => isAdmin || !item.adminOnly)
        .map((item) => {
            if (!item.children) return item
            const children = item.children.filter((child) => isAdmin || !child.adminOnly)
            return {...item, children}
        })
        .filter((item) => !item.children || item.children.length > 0)
}

/**
 * 根据当前路径匹配命中的菜单项
 *
 * @param menu 菜单树
 * @param path 当前路由路径
 * @returns 命中的一级菜单与子菜单
 */
export function matchMenu(menu: MenuItem[], path: string): { group?: MenuItem; item?: MenuItem } {
    for (const group of menu) {
        if (!group.children) {
            if (path === group.path || path.startsWith(`${group.path}/`)) {
                return {item: group}
            }
            continue
        }
        const hit = group.children.find((child) => path === child.path || path.startsWith(`${child.path}/`))
        if (hit) {
            return {group, item: hit}
        }
    }
    return {}
}
