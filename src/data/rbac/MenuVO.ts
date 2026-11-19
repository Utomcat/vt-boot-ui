/**
 * 菜单视图对象(对齐后端 MenuVO)
 */
export interface MenuVO {
    // 菜单 ID
    id: number
    // 父菜单 ID, 0 表示顶级
    parentId?: number
    // 菜单名称
    name: string
    // 类型: DIR-目录 MENU-页面 BUTTON-按钮
    type: string
    // 路由地址
    path?: string
    // 前端组件标识
    component?: string
    // 图标名称
    icon?: string
    // 权限码
    permission?: string
    // 排序值
    sort?: number
    // 是否在侧边栏显示: 1-显示 0-隐藏
    visible?: number
    // 状态: 1-正常 0-禁用
    status?: number
    // 创建时间
    createTime?: string
    // 下级菜单
    children?: MenuVO[]
}
