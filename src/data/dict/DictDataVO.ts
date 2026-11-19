/**
 * 字典数据接口(对齐后端 DictDataVO)
 */
export interface DictDataVO {
    // 字典数据 ID
    id: number
    // 所属字典类型编码
    dictType: string
    // 字典标签
    dictLabel: string
    // 字典键值
    dictValue: string
    // 排序值
    dictSort?: number
    // 标签样式: primary / success / warning / danger / info
    tagType?: string
    // 额外样式类名
    cssClass?: string
    // 是否默认选中: 1-是 0-否
    isDefault?: number
    // 状态: 1-正常 0-禁用
    status?: number
    // 备注
    remark?: string
    // 创建时间
    createTime?: string
}
