/// <reference types="vite/client" />

interface ImportMetaEnv {
    // 品牌短名
    readonly VITE_APP_NAME?: string
    // 品牌副标题
    readonly VITE_APP_SUBTITLE?: string
    // 完整标题
    readonly VITE_APP_TITLE?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
