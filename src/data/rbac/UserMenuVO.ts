import {MenuVO} from './MenuVO.ts'

/**
 * 当前登录用户的角色、权限与菜单树(对齐后端 UserMenuVO)
 */
export interface UserMenuVO {
    // 角色编码集合
    roles: string[]
    // 权限码集合, 超级管理员为 ["*"]
    permissions: string[]
    // 可见菜单树(仅目录与页面)
    menus: MenuVO[]
}
