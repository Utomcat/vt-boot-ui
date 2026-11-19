/**
 * 前端页面组件注册表
 *
 * 后端菜单中的 component 字段只保存组件标识(如 system/user/UserList), 由本表映射为真实的动态导入,
 * 未注册的标识会被忽略, 从而避免后端数据决定任意组件加载。
 */
export const VIEW_COMPONENTS: Record<string, () => Promise<unknown>> = {
    'dashboard/Dashboard': () => import('../views/dashboard/Dashboard.vue'),
    'system/user/UserList': () => import('../views/system/user/UserList.vue'),
    'system/tenant/TenantList': () => import('../views/system/tenant/TenantList.vue'),
    'system/log/LoginLogList': () => import('../views/system/log/LoginLogList.vue'),
    'system/role/RoleList': () => import('../views/system/role/RoleList.vue'),
    'system/menu/MenuList': () => import('../views/system/menu/MenuList.vue'),
    'system/dict/DictTypeList': () => import('../views/system/dict/DictTypeList.vue'),
    'task/JobList': () => import('../views/task/JobList.vue'),
    'task/JobLogList': () => import('../views/task/JobLogList.vue'),
}
