import {ref} from 'vue'
import {fetchDictDataByType} from '../api/dict.ts'
import {DictDataVO} from '../data/dict/DictDataVO.ts'

/**
 * 字典数据加载组合式函数(业务端读取字典的统一入口)
 * <p>
 * 每次调用 load 都会请求后端字典读取接口; 后端已对字典读取启用缓存(未命中回源并回填), 前端无需再自行缓存。
 * 若个别场景仍希望避免重复请求, 可在此基础上叠加内存/会话级缓存。
 * </p>
 *
 * @returns 字典数据列表、加载状态、加载方法与按值取标签的辅助方法
 */
export function useDict() {
    // 字典数据列表
    const data = ref<DictDataVO[]>([])
    // 加载状态
    const loading = ref(false)
    // 当前字典类型编码
    const dictType = ref('')

    /**
     * 加载指定字典类型的数据
     *
     * @param type 字典类型编码
     */
    const load = async (type: string) => {
        dictType.value = type
        loading.value = true
        try {
            const res = await fetchDictDataByType(type)
            data.value = res.data || []
        } finally {
            loading.value = false
        }
    }

    /**
     * 根据字典键值获取字典标签
     *
     * @param value 字典键值
     * @returns 匹配的字典标签, 未匹配时返回原值
     */
    const labelOf = (value?: string | number): string => {
        if (value === undefined || value === null) return ''
        const target = String(value)
        const matched = data.value.find((item) => item.dictValue === target)
        return matched ? matched.dictLabel : target
    }

    /**
     * 根据字典键值获取标签样式(tagType)
     *
     * @param value 字典键值
     * @returns Element Plus 标签类型, 未匹配时返回 info
     */
    const tagOf = (value?: string | number): string => {
        if (value === undefined || value === null) return 'info'
        const target = String(value)
        const matched = data.value.find((item) => item.dictValue === target)
        return matched?.tagType || 'info'
    }

    return {data, loading, dictType, load, labelOf, tagOf}
}
