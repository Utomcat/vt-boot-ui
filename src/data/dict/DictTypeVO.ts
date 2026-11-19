/**
 * 字典类型接口(对齐后端 DictTypeVO)
 */
export interface DictTypeVO {
    // 字典类型 ID
    id: number
    // 字典名称
    dictName: string
    // 字典类型编码(唯一标识)
    dictType: string
    // 状态: 1-正常 0-禁用
    status?: number
    // 备注
    remark?: string
    // 创建时间
    createTime?: string
}
