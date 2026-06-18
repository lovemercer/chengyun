/**
 * 海康 Artemis 事件库 API 接口函数
 *
 * 类型定义 → src/api/types.ts
 */

import { get, post, request } from './request'
import type {
  EventBasicInfo,
  IndexProperty,
  QueryParams,
  QueryResult,
  StatisticParams,
  StatisticResult,
  CameraPageData,
} from './types'

// 重导出类型，外部无需感知文件拆分
export type {
  EventBasicInfo,
  IndexProperty,
  FieldOption,
  SortOption,
  QueryParams,
  QueryResult,
  StatisticParams,
  StatisticResult,
  CameraItem,
  CameraPageData,
} from './types'

// ============================================================
// API 1: 全域事件库事件类型获取
// ============================================================

export async function getAllEventBasicInfo(filterNoEventTask = true) {
  return request<EventBasicInfo[]>('POST', '/api/v1/dataEvent/getAllEventBasicInfo', {
    query: { filterNoEventTask },
  })
}

// ============================================================
// API 4: 根据事件类型id获取ES字段属性列表
// ============================================================

export async function getIndexProperties(eventTableIndexCode: string) {
  return get<{
    esIndexName: string
    esAliasName: string
    cols: IndexProperty[]
  }>('/api/v1/dataEvent/getIndexProperties', { eventTableIndexCode })
}

// ============================================================
// API 5: 通用事件检索
// ============================================================

export async function queryEvents(params: QueryParams) {
  return post<QueryResult>('/api/common/v1/query', params as unknown as Record<string, unknown>)
}

// ============================================================
// API 6: 通用事件统计
// ============================================================

export async function statisticEvents(params: StatisticParams) {
  return post<StatisticResult>('/api/common/v1/statistic', params as unknown as Record<string, unknown>)
}

// ============================================================
// API 7: 分页获取视频点位资源（摄像头）
// ============================================================

export async function fetchCameras(pageNo: number, pageSize: number) {
  return post<CameraPageData>('/api/resource/v1/cameras', {
    pageNo,
    pageSize,
    treeCode: '0',
  })
}
