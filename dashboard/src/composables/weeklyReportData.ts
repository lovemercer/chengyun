import { queryEvents, statisticEvents } from '@/api/event'
import type { QueryParams, QueryResult, StatisticResult } from '@/api/event'
import type { AlgorithmRow, WeeklyReportData } from '@/api/weeklyReport'
import {
  ES_INDEX,
  F_TIME,
  F_TYPE,
  dateRange,
  makeStatParams,
  weekRange,
} from './queryHelpers'
import { useCameraData } from './useCameraData'
import { useEventData } from './useEventData'

const REPORT_UNIT = import.meta.env.VITE_WEEKLY_REPORT_UNIT || '中国移动通信集团城东分公司'
const REPORT_PAGE_SIZE = 20000

const CAMERA_CODE_FIELDS = [
  'paramsEventsDataTargetAttrsCameraIndexCode',
  'paramsEventsSrcIndex',
  'paramsEventsDataTargetAttrsDeviceIndexCode',
] as const

const EVENT_LOCATION_FIELDS = [
  'paramsEventsDataTargetAttrsCameraName',
  'paramsEventsDataTargetAttrsCameraAddress',
] as const

const REPORT_RETURN_FIELDS = [
  F_TIME,
  F_TYPE,
  ...CAMERA_CODE_FIELDS,
  ...EVENT_LOCATION_FIELDS,
].join(',')

type EventRecord = Record<string, unknown>

interface TypeSummary {
  name: string
  events: number
  cameras: Set<string>
  locations: Map<string, number>
}

export async function fetchWeeklyReportData(now = new Date()): Promise<WeeklyReportData> {
  const { init, getNameByCode } = useEventData()
  const { preload, getLocation } = useCameraData()

  await Promise.all([
    init(),
    preload(),
  ])

  const week = weekRange(now)
  const weekFilter = dateRange(week.thisStart, week.thisEnd)
  const lastWeekFilter = dateRange(week.lastStart, week.lastEnd)

  const [typeStats, lastWeekTypeStats, weekEvents, lastWeekEvents] = await Promise.all([
    statisticEvents(makeStatParams({
      maxRows: 100,
      timeFilter: weekFilter,
      groupByCols: F_TYPE,
    })),
    statisticEvents(makeStatParams({
      maxRows: 100,
      timeFilter: lastWeekFilter,
      groupByCols: F_TYPE,
    })),
    queryReportEvents(weekFilter),
    queryReportEvents(lastWeekFilter),
  ])

  const summaries = buildTypeSummaries(
    typeStats.data,
    weekEvents.list,
    getNameByCode,
    getLocation,
  )
  const lastWeekTypeCounts = buildTypeCountMap(lastWeekTypeStats.data, getNameByCode)

  const currentCameraCodes = collectCameraCodes(weekEvents.list)
  const lastWeekCameraCodes = collectCameraCodes(lastWeekEvents.list)
  const newCameraCount = Array.from(currentCameraCodes)
    .filter(code => !lastWeekCameraCodes.has(code))
    .length

  const algorithms = summaries.map<AlgorithmRow>((item, index) => ({
    seq: index + 1,
    type: item.name,
    cameras: item.cameras.size,
    events: item.events,
    accuracy: '核验中',
    remark: buildTrendRemark(item.events, lastWeekTypeCounts.get(item.name) || 0),
  }))

  const totalAlerts = algorithms.reduce((sum, item) => sum + item.events, 0)
  const lastWeekTotalAlerts = sumTypeStats(lastWeekTypeStats.data) || lastWeekEvents.total

  return {
    reportPeriod: `${formatDate(week.thisStart)}-${formatDate(week.thisEnd)}`,
    reportUnit: REPORT_UNIT,
    reportDate: formatDate(now),

    newCameras: newCameraCount,
    totalCameras: currentCameraCodes.size,
    totalAlerts,
    accuracy: '核验中',

    algorithms,

    distributionSummary: buildDistributionSummary(summaries, totalAlerts, lastWeekTotalAlerts),
    keyEventsSummary: buildKeyEventsSummary(summaries),

    overallAccuracy: '核验中',
    accuracyDirection: '',
    accuracyChange: '核验中',
    falsePositives: '核验中',
    falseNegatives: '核验中',
    optimizationMeasures: buildOptimizationMeasures(summaries),

    problems: buildProblems(summaries, totalAlerts),
    nextWeekPlan: buildNextWeekPlan(summaries),
  }
}

async function queryReportEvents(timeFilter: string): Promise<QueryResult> {
  const first = await queryEvents(makeReportQueryParams(timeFilter, 1))
  const list = [...first.data.list]
  const total = first.data.total || list.length
  const pageCount = Math.ceil(total / REPORT_PAGE_SIZE)

  for (let pageNo = 2; pageNo <= pageCount; pageNo++) {
    const res = await queryEvents(makeReportQueryParams(timeFilter, pageNo))
    list.push(...res.data.list)
  }

  return {
    ...first.data,
    total,
    list,
  }
}

function makeReportQueryParams(timeFilter: string, pageNo: number): QueryParams {
  return {
    returnFields: REPORT_RETURN_FIELDS,
    eventName: ES_INDEX,
    pageNo,
    pageSize: REPORT_PAGE_SIZE,
    fieldOptions: [{ fieldName: F_TIME, value: timeFilter, type: 'timeRange' }],
    sort: [{ method: 'desc', column: F_TIME }],
  }
}

function buildTypeSummaries(
  stats: StatisticResult,
  records: EventRecord[],
  getNameByCode: (code: string) => string | undefined,
  getLocation: (code: string | undefined | null) => string,
): TypeSummary[] {
  const summaries = new Map<string, TypeSummary>()
  const recordCounts = new Map<string, number>()

  for (const item of stats) {
    const name = resolveTypeName(item.value || item.colName, getNameByCode)
    const summary = getOrCreateSummary(summaries, name)
    summary.events += getStatCount(item)
  }

  for (const record of records) {
    const typeName = resolveTypeName(getRecordType(record), getNameByCode)
    const summary = getOrCreateSummary(summaries, typeName)
    recordCounts.set(typeName, (recordCounts.get(typeName) || 0) + 1)

    const cameraCode = getRecordCameraCode(record)
    if (!cameraCode) continue

    summary.cameras.add(cameraCode)
    const location = getRecordLocation(record, getLocation)
    if (location) {
      summary.locations.set(location, (summary.locations.get(location) || 0) + 1)
    }
  }

  for (const [name, count] of recordCounts) {
    const summary = summaries.get(name)
    if (summary && summary.events === 0) {
      summary.events = count
    }
  }

  return Array.from(summaries.values())
    .filter(item => item.events > 0 || item.cameras.size > 0)
    .sort((a, b) => b.events - a.events)
}

function buildTypeCountMap(
  stats: StatisticResult,
  getNameByCode: (code: string) => string | undefined,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of stats) {
    const name = resolveTypeName(item.value || item.colName, getNameByCode)
    counts.set(name, (counts.get(name) || 0) + getStatCount(item))
  }
  return counts
}

function sumTypeStats(stats: StatisticResult): number {
  return stats.reduce((sum, item) => sum + getStatCount(item), 0)
}

function getStatCount(item: { count?: number; docCount?: number }): number {
  return item.count || item.docCount || 0
}

function getOrCreateSummary(summaries: Map<string, TypeSummary>, name: string): TypeSummary {
  const current = summaries.get(name)
  if (current) return current

  const next: TypeSummary = {
    name,
    events: 0,
    cameras: new Set<string>(),
    locations: new Map<string, number>(),
  }
  summaries.set(name, next)
  return next
}

function resolveTypeName(
  rawValue: unknown,
  getNameByCode: (code: string) => string | undefined,
): string {
  const value = String(rawValue || '').trim()
  if (!value) return '未知类型'
  return getNameByCode(value) || value
}

function getRecordType(record: EventRecord): string {
  return String(record[F_TYPE] || record.sys_exclusive_eventTypeName || '未知类型')
}

function getRecordCameraCode(record: EventRecord): string | undefined {
  return getRecordCameraCodes(record)[0]
}

function getRecordCameraCodes(record: EventRecord): string[] {
  const codes: string[] = []
  for (const field of CAMERA_CODE_FIELDS) {
    const value = record[field]
    if (typeof value !== 'string') continue

    const code = value.trim()
    if (code && !codes.includes(code)) codes.push(code)
  }
  return codes
}

function getRecordLocation(
  record: EventRecord,
  getLocation: (code: string | undefined | null) => string,
): string {
  const codes = getRecordCameraCodes(record)
  for (const code of codes) {
    const location = getLocation(code)
    if (location && location !== '--' && location !== code) return location
  }

  for (const field of EVENT_LOCATION_FIELDS) {
    const value = record[field]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  const firstCode = codes[0]
  if (!firstCode) return ''

  const fallback = getLocation(firstCode)
  return fallback && fallback !== '--' ? fallback : ''
}

function collectCameraCodes(records: EventRecord[]): Set<string> {
  const codes = new Set<string>()
  for (const record of records) {
    const cameraCode = getRecordCameraCode(record)
    if (cameraCode) codes.add(cameraCode)
  }
  return codes
}

function buildDistributionSummary(summaries: TypeSummary[], total: number, lastWeekTotal: number): string {
  if (total <= 0) {
    return '本周未检索到告警事件。'
  }

  const topItems = summaries.slice(0, 6)
  const topTotal = topItems.reduce((sum, item) => sum + item.events, 0)
  const parts = topItems.map(item =>
    `${item.name}${formatCount(item.events)}起，占比${formatRatio(item.events, total)}`,
  )

  const otherTotal = total - topTotal
  if (otherTotal > 0) {
    parts.push(`其余类型合计${formatCount(otherTotal)}起，占比${formatRatio(otherTotal, total)}`)
  }

  return `按算法类型分布：本周累计告警事件${formatCount(total)}起${buildTotalTrendText(total, lastWeekTotal)}；其中，${parts.join('；')}。`
}

function buildKeyEventsSummary(summaries: TypeSummary[]): string {
  const topItems = summaries.filter(item => item.events > 0).slice(0, 5)
  if (topItems.length === 0) {
    return '本周暂无主要告警事件。'
  }

  const parts = topItems.map((item) => {
    const locations = getTopLocations(item.locations, 3)
    const locationText = locations.length > 0
      ? `，高发点位包含${locations.join('、')}`
      : ''
    return `${item.name}${formatCount(item.events)}条${locationText}`
  })

  return `本周主要告警事件为：${parts.join('；')}。`
}

function buildOptimizationMeasures(summaries: TypeSummary[]): string {
  const topNames = summaries.filter(item => item.events > 0).slice(0, 3).map(item => item.name)
  if (topNames.length === 0) {
    return '持续关注AI赋能点位运行状态，暂无重点算法优化项。'
  }
  return `围绕${topNames.join('、')}等高频事件类型，结合高发点位持续优化算法参数及告警处置联动。`
}

function buildProblems(summaries: TypeSummary[], totalAlerts: number): string {
  if (totalAlerts <= 0) {
    return '1、本周暂无告警事件数据，需持续关注系统运行稳定性；\n2、需持续做好AI赋能点位巡检和算法运行监测，保障告警发现能力稳定。'
  }

  const top = summaries[0]
  return `1、本周${top.name}事件量较高，需重点关注高发点位处置闭环；\n2、需持续加强高频事件点位巡查和告警核验，提升发现、派发、处置闭环效率。`
}

function buildNextWeekPlan(summaries: TypeSummary[]): string {
  const topNames = summaries.filter(item => item.events > 0).slice(0, 3).map(item => item.name)
  if (topNames.length === 0) {
    return '持续监测AI赋能点位运行情况，根据实际事件数据优化点位覆盖和算法配置。'
  }
  return `根据本周${topNames.join('、')}等高频事件及高发点位，持续优化AI赋能点位覆盖、算法参数配置及事件处置闭环。`
}

function buildTrendRemark(current: number, lastWeek: number): string {
  if (current === 0 && lastWeek === 0) return '本周无告警'
  if (lastWeek === 0) return '上周无告警，本周新增'

  const diff = current - lastWeek
  if (diff === 0) return '较上周持平'

  const direction = diff > 0 ? '上升' : '下降'
  return `较上周${direction}${formatRatio(Math.abs(diff), lastWeek)}`
}

function buildTotalTrendText(current: number, lastWeek: number): string {
  if (lastWeek <= 0) return '，上周无告警数据'

  const diff = current - lastWeek
  if (diff === 0) return '，较上周持平'

  const direction = diff > 0 ? '上升' : '下降'
  return `，较上周${formatCount(lastWeek)}起${direction}${formatRatio(Math.abs(diff), lastWeek)}`
}

function getTopLocations(locations: Map<string, number>, limit: number): string[] {
  return Array.from(locations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name)
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatCount(n: number): string {
  return n.toLocaleString('zh-CN')
}

function formatRatio(value: number, total: number): string {
  if (total <= 0) return '0%'
  return `${((value / total) * 100).toFixed(2)}%`
}
