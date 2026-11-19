/**
 * 字典类型新增/修改参数接口(对齐后端 DictTypeFormPO)
 */
export interface DictTypeForm {
    // 字典类型 ID, 新增时为空, 修改时必填
    id?: number
    // 字典名称
    dictName?: string
    // 字典类型编码(唯一标识), 如 sys_user_status
    dictType?: string
    // 状态: 1-正常 0-禁用
    status?: number
    // 备注
    remark?: string
}
