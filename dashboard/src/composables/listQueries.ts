/**
 * 列表类查询（全部走 API 5: queryEvents）
 */

import { queryEvents } from '@/api/event'
import { useCameraData } from './useCameraData'
import {
  ES_INDEX,
  F_TIME,
  F_TYPE,
  timeRange,
  dateRange,
  daysAgo,
  weekRange,
  monthRange,
  mapEventRecord,
} from './queryHelpers'

// ============================================================
// filterPeriod → timeRange 字符串
// ============================================================

function periodToFilter(period: string, weekday?: number): string {
  const now = new Date()
  const week = weekRange(now)
  const month = monthRange(now)

  // 如果指定了 weekday，先算那天的日期再套 timeRange
  if (weekday !== undefined && weekday >= 0) {
    const baseMonday = period === 'last_week' ? week.lastStart : week.thisStart
    const targetDate = new Date(baseMonday.getTime() + weekday * 86400000)
    return timeRange(targetDate)
  }

  switch (period) {
    case 'today':
      return timeRange(now)
    case 'yesterday':
      return timeRange(daysAgo(1))
    case 'this_week':
      return dateRange(week.thisStart, week.thisEnd)
    case 'last_week':
      return dateRange(week.lastStart, week.lastEnd)
    case 'this_month':
      return dateRange(month.thisStart, month.thisEnd)
    case 'last_month':
      return dateRange(month.lastStart, month.lastEnd)
    default:
      return ''
  }
}

/** "MM-DD" → ISO timeRange */
function dateStrToFilter(dateStr: string): string {
  // 已是 ISO 格式就直接用
  if (dateStr.includes('T')) return dateStr
  const [m, d] = dateStr.split('-').map(Number)
  const now = new Date()
  const target = new Date(now.getFullYear(), m - 1, d)
  return timeRange(target)
}

// ============================================================
// 最新事件抓拍
// ============================================================

export async function fetchLatestCaptures(limit = 6) {
  const { getLocation } = useCameraData()
  const res = await queryEvents({
    returnFields: '*',
    eventName: ES_INDEX,
    pageNo: 1,
    pageSize: limit,
    sort: [{ method: 'desc', column: F_TIME }],
  })

  return res.data.list.map((record, i) => {
    const mapped = mapEventRecord(record, getLocation, i)
    return { id: mapped.id, time: mapped.time, type: mapped.type, location: mapped.location }
  })
}

// ============================================================
// 详情弹窗（分页 + 过滤）
// ============================================================

export async function fetchDetailRecords(opts?: {
  filterType?: string
  filterPeriod?: string
  filterWeekday?: number
  filterDate?: string
  pageNo?: number
  pageSize?: number
}) {
  const { getLocation } = useCameraData()

  const fieldOptions: Array<{ fieldName: string; value: string; type: 'terms' | 'timeRange' }> = []

  // 事件类型过滤
  if (opts?.filterType) {
    fieldOptions.push({ fieldName: F_TYPE, value: opts.filterType, type: 'terms' })
  }

  // 时间段过滤
  if (opts?.filterPeriod) {
    const timeFilter = periodToFilter(opts.filterPeriod, opts.filterWeekday)
    if (timeFilter) {
      fieldOptions.push({ fieldName: F_TIME, value: timeFilter, type: 'timeRange' })
    }
  } else if (opts?.filterDate) {
    // filterDate 可能是 "MM-DD" 格式，需转成 ISO timeRange
    const iso = dateStrToFilter(opts.filterDate)
    fieldOptions.push({ fieldName: F_TIME, value: iso, type: 'timeRange' })
  }

  const res = await queryEvents({
    returnFields: '*',
    eventName: ES_INDEX,
    pageNo: opts?.pageNo ?? 1,
    pageSize: opts?.pageSize ?? 10,
    fieldOptions,
    sort: [{ method: 'desc', column: F_TIME }],
  })

  const list = res.data.list.map((r, i) => ({
    ...mapEventRecord(r, getLocation, i),
    detail: (r.paramsEventsDataEventDescription || '--') as string,
  }))

  return { list, total: res.data.total }
}
