/**
 * 海康 Artemis 事件库 API 接口函数
 *
 * 所有函数已对接真实接口路径和参数，当前全部注释。
 * 对接时取消注释，填入正确的接口路径和参数即可。
 */

import { get, post } from './request'

// ============================================================
// 类型定义
// ============================================================

/** 事件基础信息 */
export interface EventBasicInfo {
  id: number
  eventTableIndexCode: string
  name: string
}

/** 事件详细信息 */
export interface EventDetailInfo {
  id: number
  eventTableIndexCode: string
  name: string
  esIndexName: string
  esAliasName: string
  kafkaTopicName: string
  rmqTopicName: string
  exchange: string
  routingKey: string
  connectionMode: string
  resourceInfos: Array<{
    resourceIndexCode: string
    resourceName: string
    properties: Record<string, unknown>
  }>
  sceneInfos: Array<{
    sceneId: string
    sceneNameStrand: string
    sceneIdStrand: string
  }>
}

/** 事件报文字段 */
export interface EventMqField {
  fieldName: string
  fieldNumber: string
  fieldIndexCode: string
  fieldParentIndexCode: string
  id: string
  fieldIndex: string
  fieldStore: string
  fieldType: string
  fieldColumnFamily: string
  fieldSize: string
  fieldNote: string
  fieldChoice: string
  regularChoice: string
  fieldExplain: string
  regularName: string
  eventTableIndexCode: string
}

/** ES 索引字段属性 */
export interface IndexProperty {
  propertiesEnName: string
  propertiesZhName: string
  propertiesAliasName: string
  type: string
}

/** 事件检索查询条件 */
export interface FieldOption {
  fieldName: string
  value: string
  type: 'terms' | 'in' | 'like' | 'lt' | 'le' | 'gt' | 'ge' | 'range' | 'timeRange'
}

/** 事件检索排序 */
export interface SortOption {
  method: 'desc' | 'asc'
  column: string
}

/** 事件检索请求参数 */
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

/** 事件检索结果 */
export interface QueryResult {
  total: number
  list: Array<Record<string, unknown>>
}

/** 事件统计请求参数 */
export interface StatisticParams {
  eventName: string
  maxRows: number
  fieldOptions: FieldOption[]
  aggCols: Array<{ name: string; aggFunc: string }>
  groupByCols: string
}

/** 事件统计结果 */
export interface StatisticResult {
  total: number
  list: Array<{
    colName: string
    value: string
    aggType: string
    docCount: number
    children?: Array<{
      colName: string
      value: string
      aggType: string
    }>
  }>
}

/** 事件编码搜索结果 */
export interface EventCodeItem {
  eventName: string
  eventCode: string
}

// ============================================================
// API 1: 全域事件库事件类型获取
// ============================================================

// export async function getAllEventBasicInfo(filterNoEventTask = false) {
//   return get<EventBasicInfo[]>('/api/v1/dataEvent/getAllEventBasicInfo', {
//     filterNoEventTask,
//   })
// }

/** [Mock] 获取所有事件类型 */
export async function getAllEventBasicInfo(_filterNoEventTask = false) {
  return {
    code: 0 as const,
    msg: 'SUCCESS',
    data: [
      { id: 1, eventTableIndexCode: 'mock-code-001', name: '占道经营' },
      { id: 2, eventTableIndexCode: 'mock-code-002', name: '垃圾暴露' },
      { id: 3, eventTableIndexCode: 'mock-code-003', name: '车辆违停' },
      { id: 4, eventTableIndexCode: 'mock-code-004', name: '人居环境' },
      { id: 5, eventTableIndexCode: 'mock-code-005', name: '乱贴广告' },
      { id: 6, eventTableIndexCode: 'mock-code-006', name: '小街面商' },
      { id: 7, eventTableIndexCode: 'mock-code-007', name: '人员聚集' },
      { id: 8, eventTableIndexCode: 'mock-code-008', name: '乱堆暴露' },
      { id: 9, eventTableIndexCode: 'mock-code-009', name: '其他事件' },
    ],
  }
}

// ============================================================
// API 2: 全域事件库事件类型详细信息获取
// ============================================================

// export async function getEventDetailInfoByIds(
//   eventTableIndexCodes: string[],
//   filterNoEventTask = false,
// ) {
//   return post<EventDetailInfo[]>('/api/v1/dataEvent/getEventDetailInfoByIds', {
//     eventTableIndexCodes,
//     filterNoEventTask,
//   })
// }

/** [Mock] 获取事件类型详情 */
export async function getEventDetailInfoByIds(
  _eventTableIndexCodes: string[],
  _filterNoEventTask = false,
) {
  return {
    code: '0' as const,
    msg: 'SUCCESS',
    data: [] as EventDetailInfo[],
  }
}

// ============================================================
// API 3: 全域事件库目标事件报文协议获取
// ============================================================

// export async function getEventMqField(eventTableIndexCode: string) {
//   return get<{
//     jsonModel: string
//     schemaModel: string
//     fieldList: EventMqField[]
//   }>('/api/v1/dataTable/getEventMqField', { eventTableIndexCode })
// }

/** [Mock] 获取事件报文字段 */
export async function getEventMqField(_eventTableIndexCode: string) {
  return {
    code: '0' as const,
    msg: 'SUCCESS',
    data: {
      jsonModel: '{}',
      schemaModel: '{}',
      fieldList: [] as EventMqField[],
    },
  }
}

// ============================================================
// API 4: 根据事件类型id获取ES字段属性列表
// ============================================================

// export async function getIndexProperties(eventTableIndexCode: string) {
//   return get<{
//     esIndexName: string
//     esAliasName: string
//     cols: IndexProperty[]
//   }>('/api/v1/dataEvent/getIndexProperties', { eventTableIndexCode })
// }

/** [Mock] 获取 ES 字段属性 */
export async function getIndexProperties(_eventTableIndexCode: string) {
  return {
    code: '0' as const,
    msg: 'SUCCESS',
    data: {
      esIndexName: 'mock.event.index',
      esAliasName: 'mock_event_alias',
      cols: [
        { propertiesEnName: 'happenTime', propertiesZhName: '发生时间', propertiesAliasName: '', type: 'long' },
        { propertiesEnName: 'eventType', propertiesZhName: '事件类型', propertiesAliasName: '', type: 'keyword' },
        { propertiesEnName: 'locationName', propertiesZhName: '关联地址', propertiesAliasName: '', type: 'keyword' },
        { propertiesEnName: 'detail', propertiesZhName: '事件描述', propertiesAliasName: '', type: 'keyword' },
      ] as IndexProperty[],
    },
  }
}

// ============================================================
// API 5: 通用事件检索
// ============================================================

// export async function queryEvents(params: QueryParams) {
//   return post<QueryResult>('/api/common/v1/query', params as unknown as Record<string, unknown>)
// }

/** [Mock] 通用事件检索 */
export async function queryEvents(_params: QueryParams) {
  // 返回空结果，实际数据由 useEventQuery 中的 mock 逻辑处理
  return {
    code: '0' as const,
    msg: 'SUCCESS',
    data: {
      total: 0,
      list: [] as Array<Record<string, unknown>>,
    },
  }
}

// ============================================================
// API 6: 通用事件统计
// ============================================================

// export async function statisticEvents(params: StatisticParams) {
//   return post<StatisticResult>('/api/common/v1/statistic', params as unknown as Record<string, unknown>)
// }

/** [Mock] 通用事件统计 */
export async function statisticEvents(_params: StatisticParams) {
  return {
    code: '0' as const,
    msg: 'SUCCESS',
    data: {
      total: 0,
      list: [] as StatisticResult['list'],
    },
  }
}

// ============================================================
// API 7: 通过事件名称或者事件码获取事件列表
// ============================================================

// export async function searchEventCodes(keyword = '', pageNo = 1, pageSize = 20) {
//   return post<{
//     pageNo: number
//     pageSize: number
//     total: number
//     totalPage: number
//     list: EventCodeItem[]
//   }>('/api/eventCode/v1/searchEventCodes', { keyword, pageNo, pageSize })
// }

/** [Mock] 搜索事件编码 */
export async function searchEventCodes(_keyword = '', _pageNo = 1, _pageSize = 20) {
  return {
    code: '0' as const,
    msg: 'SUCCESS',
    data: {
      pageNo: 1,
      pageSize: 20,
      total: 0,
      totalPage: 0,
      list: [] as EventCodeItem[],
    },
  }
}
