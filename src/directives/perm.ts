import type {Directive, DirectiveBinding} from 'vue'
import {useUserStore} from '../stores/user.ts'

/**
 * 按钮级权限指令
 *
 * 用法: v-perm="'system:user:add'" 或 v-perm="['system:user:add','system:user:edit']"
 * 当前用户不满足任一权限码时, 指令会将元素从 DOM 中移除。
 */
function applyPermission(el: HTMLElement, binding: DirectiveBinding<string | string[]>): void {
    const value = binding.value
    if (!value) return
    const codes = Array.isArray(value) ? value : [value]
    const userStore = useUserStore()
    if (!codes.some((code) => userStore.hasPerm(code))) {
        el.parentNode?.removeChild(el)
    }
}

export const perm: Directive<HTMLElement, string | string[]> = {
    mounted(el, binding) {
        applyPermission(el, binding)
    },
}
