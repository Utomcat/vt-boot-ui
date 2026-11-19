/**
 * 应用品牌配置
 *
 * 品牌名称统一从 .env 中的 VITE_APP_* 变量读取, 未配置时回退到默认值。
 * 所有展示系统品牌名称的位置(侧边栏、登录页、浏览器标题、工作台等)均读取此对象,
 * 修改 .env 即可全局替换品牌, 无需逐处改动代码。
 */
const name = import.meta.env.VITE_APP_NAME?.trim() || 'VT-Boot'
const subtitle = import.meta.env.VITE_APP_SUBTITLE?.trim() || '后台管理系统'
const title = import.meta.env.VITE_APP_TITLE?.trim() || `${name} ${subtitle}`

export const appConfig = {
  // 品牌短名, 用于侧边栏/登录页 Logo 文本
  name,
  // 品牌副标题, 如 “后台管理系统”
  subtitle,
  // 完整标题, 用于浏览器标签标题与工作台欢迎语
  title,
}
