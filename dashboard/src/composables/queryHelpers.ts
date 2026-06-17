/**
 * 事件查询 — 工具函数 / 常量 / 记录映射
 */

import type { StatisticParams, StatisticResult } from '@/api/event'

// ============================================================
// 常量
// ============================================================

export const ES_INDEX = 'eventlib.city_management'
export const F_TIME = 'paramsEventsHappenTime'
export const F_TYPE = 'sys_exclusive_eventTypeName'

// ============================================================
// 日期工具
// ============================================================

function pad(n: number, len = 2) {
  return String(n).padStart(len, '0')
}

function tzOffset(): string {
  const off = -new Date().getTimezoneOffset()
  return `${off >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

/** 单天覆盖范围字符串 "["2026-06-17T00:00:00+08:00,2026-06-17T23:59:59+08:00]" */
export function timeRange(d: Date): string {
  const s = `${fmtDate(d)}T00:00:00.000${tzOffset()}`
  const e = `${fmtDate(d)}T23:59:59.999${tzOffset()}`
  return `[${s}, ${e}]`
}

/** 多天覆盖范围字符串 */
export function dateRange(start: Date, end: Date): string {
  return `[${fmtDate(start)}T00:00:00.000${tzOffset()}, ${fmtDate(end)}T23:59:59.999${tzOffset()}]`
}

/** 今天的 date 范围 */
export function todayRange() {
  return { start: new Date(), end: new Date() }
}

/** 本周范围 { thisMon, thisEnd, lastMon, lastEnd } */
export function weekRange(now: Date) {
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const thisMon = new Date(now)
  thisMon.setDate(now.getDate() - dayOfWeek + 1)
  const lastMon = new Date(thisMon.getTime() - 7 * 86400000)
  const lastSun = new Date(thisMon.getTime() - 86400000)
  return { thisStart: thisMon, thisEnd: now, lastStart: lastMon, lastEnd: lastSun }
}

/** 本月范围 */
export function monthRange(now: Date) {
  const thisStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  return { thisStart, thisEnd: now, lastStart, lastEnd }
}

/** 本年范围 */
export function yearRange(now: Date) {
  const thisStart = new Date(now.getFullYear(), 0, 1)
  const lastStart = new Date(now.getFullYear() - 1, 0, 1)
  const lastEnd = new Date(now.getFullYear() - 1, 11, 31)
  return { thisStart, thisEnd: now, lastStart, lastEnd }
}

// ============================================================
// 参数构造
// ============================================================

function baseParams() {
  return {
    returnFields: '*' as const,
    eventName: ES_INDEX,
    fieldOptions: [] as Array<{ fieldName: string; value: string; type: 'timeRange' }>,
    aggCols: [] as Array<{ name: string; aggFunc: string }>,
    groupByCols: '' as string,
  }
}

/** 构造统计请求参数（带 timeRange 过滤） */
export function makeStatParams(overrides?: {
  maxRows?: number
  timeFilter?: string
  groupByCols?: string
}): StatisticParams {
  return {
    ...baseParams(),
    maxRows: overrides?.maxRows ?? 1,
    fieldOptions: overrides?.timeFilter
      ? [{ fieldName: F_TIME, value: overrides.timeFilter, type: 'timeRange' as const }]
      : [],
    groupByCols: overrides?.groupByCols ?? '',
  }
}

/** 从统计响应中取第一条的 count */
export function getCount(res: { data: StatisticResult }): number {
  return res.data[0]?.count || 0
}

// ============================================================
// 事件记录映射（fetchLatestCaptures / fetchDetailRecords 共用）
// ============================================================

export function mapEventRecord(
  record: Record<string, unknown>,
  getLocation: (code: string | undefined | null) => string,
  index?: number,
) {
  // 时间
  const ts = (record.sys_exclusive_reportTime || record[F_TIME] || record.sys_exclusive_warehouseTime) as number
  const timeIso = (record['paramsEventsDataDateTime'] as string)
    || (record['paramsEventsDataSendTime'] as string)
  const timeStr = timeIso
    ? new Date(timeIso).toLocaleString('zh-CN', { hour12: false })
    : ts
      ? new Date(ts).toLocaleString('zh-CN', { hour12: false })
      : '--'
  const dateStr = ts
    ? new Date(ts).toLocaleString('zh-CN', { hour12: false })
    : '--'

  return {
    id: (record.sys_exclusive_indexCode || record.paramsEventsEventId || record.rowKey || `${ts}-${index ?? 0}`) as string,
    time: timeStr,
    dateStr,
    type: (record.sys_exclusive_eventTypeName || record[F_TYPE] || '--') as string,
    location: getLocation(
      (record.paramsEventsDataTargetAttrsCameraIndexCode as string)
      ?? (record.paramsEventsSrcIndex as string)
      ?? (record.paramsEventsDataTargetAttrsDeviceIndexCode as string)
    ),
  }
}
