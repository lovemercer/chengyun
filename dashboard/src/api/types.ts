/**
 * 海康 Artemis 事件库 — 类型定义
 */

// ============================================================
// 事件类型
// ============================================================

/** 事件基础信息 */
export interface EventBasicInfo {
  id: number
  eventTableIndexCode: string
  name: string
}

/** ES 索引字段属性 */
export interface IndexProperty {
  propertiesEnName: string
  propertiesZhName: string
  propertiesAliasName: string
  type: string
}

// ============================================================
// 通用事件检索 (API 5)
// ============================================================

/** 检索查询条件 */
export interface FieldOption {
  fieldName: string
  value: string
  type: 'terms' | 'in' | 'like' | 'lt' | 'le' | 'gt' | 'ge' | 'range' | 'timeRange'
}

/** 检索排序 */
export interface SortOption {
  method: 'desc' | 'asc'
  column: string
}

/** 检索请求参数 */
export interface QueryParams {
  returnFields?: string
  eventName: string
  eventKeys?: string
  pageNo?: number
  pageSize?: number
  fieldOptions?: FieldOption[]
  fieldMultipleOptions?: unknown[]
  sort?: SortOption[]
}

/** 检索结果 */
export interface QueryResult {
  total: number
  list: Array<Record<string, unknown>>
}

// ============================================================
// 通用事件统计 (API 6)
// ============================================================

/** 统计请求参数 */
export interface StatisticParams {
  returnFields?: string
  eventName: string
  maxRows: number
  fieldOptions: FieldOption[]
  aggCols: Array<{ name: string; aggFunc: string }>
  groupByCols: string
}

/** 统计结果（API 实际返回 data 为数组） */
export type StatisticResult = Array<{
  colName: string
  value: string
  aggType: string
  count: number
  docCount: number
  children?: Array<{
    colName: string
    value: string
    aggType: string
  }>
}>

// ============================================================
// 视频点位资源 (API 7)
// ============================================================

/** 摄像头资源条目 */
export interface CameraItem {
  cameraIndexCode: string
  deviceIndexCode: string
  name: string
  installPlace: string
  latitude: string
  longitude: string
  unitIndexCode: string
  status: number
  statusName: string
}

/** 摄像头分页响应 */
export interface CameraPageData {
  total: number
  pageNo: number
  pageSize: number
  list: CameraItem[]
}
