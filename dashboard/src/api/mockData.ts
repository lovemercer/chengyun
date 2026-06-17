/**
 * 看板 Mock 数据（集中管理）
 *
 * 与 event.ts 共用 types.ts 的类型定义。
 *
 * 切换方式：在调用处将 import { xxx } from '@/api/event' 替换为
 *   import { xxx } from '@/api/mockData'
 */

import type {
  EventBasicInfo,
  IndexProperty,
  QueryParams,
  QueryResult,
  StatisticParams,
  StatisticResult,
} from './types'

// ============================================================
// API 1: 全域事件库事件类型获取
// ============================================================

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
// API 4: 根据事件类型id获取ES字段属性列表
// ============================================================

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

export async function queryEvents(_params: QueryParams) {
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

export async function statisticEvents(_params: StatisticParams) {
  return {
    code: '0' as const,
    msg: 'SUCCESS',
    data: [] as StatisticResult,
  }
}

// ============================================================
// 事件详情 Mock 数据（原 mockDetail.ts）
// ============================================================

export interface EventRecord {
  id: number
  time: string
  dateStr: string
  type: string
  location: string
  detail: string
  period: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month'
  weekday: number
}

const types = [
  '占道经营', '垃圾暴露', '车辆违停', '人居环境',
  '乱贴广告', '小街面商', '人员聚集', '乱堆暴露', '其他事件',
]

const locations = [
  '水木大桥路口', '喜悦广场', '名城·星耀北门', '真如大明城', '东关大街',
  '昆仑路', '建国路', '人民广场', '新华路', '解放大道',
  '和平路', '中山路', '文化街', '站前路', '长江路',
]

const details = [
  '商户占道摆放商品，影响行人通行',
  '路边垃圾堆积，未及时清理',
  '车辆违规停放，占用人行道',
  '小区环境卫生差，垃圾未分类',
  '墙面张贴非法小广告',
  '流动摊贩占道经营，堵塞交通',
  '垃圾桶满溢，周边散落垃圾',
  '私家车占用消防通道',
  '建筑垃圾未及时清运',
  '商铺门前脏乱差',
  '非法张贴招聘广告',
  '共享单车乱停乱放',
  '餐饮油烟扰民',
  '夜间施工噪音超标',
  '河道漂浮物未清理',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── 日期基准（动态计算） ──────────────────────────
const NOW = new Date()
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate())

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function getMonday(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  r.setDate(r.getDate() + diff)
  return r
}

function formatDate(d: Date): string {
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${MM}-${dd}`
}

const YESTERDAY = addDays(TODAY, -1)
const THIS_WEEK_MON = getMonday(TODAY)
const LAST_WEEK_MON = addDays(THIS_WEEK_MON, -7)
const LAST_WEEK_SUN = addDays(THIS_WEEK_MON, -1)
const THIS_MONTH_START = new Date(NOW.getFullYear(), NOW.getMonth(), 1)
const LAST_MONTH_START = new Date(NOW.getFullYear(), NOW.getMonth() - 1, 1)
const LAST_MONTH_END = addDays(THIS_MONTH_START, -1)

function thisWeekDates(): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = addDays(THIS_WEEK_MON, i)
    if (d <= TODAY) dates.push(d)
  }
  return dates
}

function lastWeekDates(): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(LAST_WEEK_MON, i))
  }
  return dates
}

function thisMonthOtherDates(): Date[] {
  const dates: Date[] = []
  for (let d = new Date(THIS_MONTH_START); d < THIS_WEEK_MON; d = addDays(d, 1)) {
    if (d >= addDays(TODAY, 1)) continue
    dates.push(d)
  }
  return dates
}

function lastMonthDates(): Date[] {
  const dates: Date[] = []
  for (let d = new Date(LAST_MONTH_START); d <= LAST_MONTH_END; d = addDays(d, 1)) {
    dates.push(d)
  }
  return dates
}

function toWeekday(d: Date): number {
  const day = d.getDay()
  return day === 0 ? 6 : day - 1
}

function getPeriod(d: Date): EventRecord['period'] {
  const t = d.getTime()
  if (t === TODAY.getTime()) return 'today'
  if (t === YESTERDAY.getTime()) return 'yesterday'
  if (t >= THIS_WEEK_MON.getTime() && t < YESTERDAY.getTime()) return 'this_week'
  if (t >= LAST_WEEK_MON.getTime() && t <= LAST_WEEK_SUN.getTime()) return 'last_week'
  if (t >= THIS_MONTH_START.getTime()) return 'this_month'
  if (t >= LAST_MONTH_START.getTime()) return 'last_month'
  return 'last_month'
}

function randomTime(date: Date): string {
  const h = Math.floor(Math.random() * 24)
  const m = Math.floor(Math.random() * 60)
  const s = Math.floor(Math.random() * 60)
  return `${formatDate(date)} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface DateSlot { date: Date; weight: number }

const dateSlots: DateSlot[] = []

thisWeekDates().filter(d => d.getTime() === TODAY.getTime()).forEach(d =>
  dateSlots.push({ date: d, weight: 40 }),
)
dateSlots.push({ date: YESTERDAY, weight: 25 })
thisWeekDates().filter(d => d.getTime() !== TODAY.getTime() && d.getTime() !== YESTERDAY.getTime()).forEach(d =>
  dateSlots.push({ date: d, weight: 12 }),
)
lastWeekDates().forEach(d =>
  dateSlots.push({ date: d, weight: 8 }),
)
thisMonthOtherDates().forEach(d =>
  dateSlots.push({ date: d, weight: 3 }),
)
lastMonthDates().forEach(d =>
  dateSlots.push({ date: d, weight: 2 }),
)

function pickWeightedDate(): Date {
  const totalWeight = dateSlots.reduce((s, slot) => s + slot.weight, 0)
  let rand = Math.random() * totalWeight
  for (const slot of dateSlots) {
    rand -= slot.weight
    if (rand <= 0) return slot.date
  }
  return dateSlots[dateSlots.length - 1].date
}

const records: EventRecord[] = Array.from({ length: 300 }, (_, i) => {
  const date = pickWeightedDate()
  return {
    id: i + 1,
    time: randomTime(date),
    dateStr: formatDate(date),
    type: randomItem(types),
    location: randomItem(locations),
    detail: randomItem(details),
    period: getPeriod(date),
    weekday: toWeekday(date),
  }
})

const THIS_MONTH_PREFIX = `${String(NOW.getMonth() + 1).padStart(2, '0')}-`
const LAST_MONTH_PREFIX = `${String(NOW.getMonth() || 12).padStart(2, '0')}-`

export function getDetailRecords(opts?: {
  filterType?: string
  filterPeriod?: string
  filterWeekday?: number
  filterDate?: string
}): EventRecord[] {
  let result = records

  if (opts?.filterType) {
    result = result.filter(r => r.type === opts.filterType)
  }
  if (opts?.filterPeriod) {
    const p = opts.filterPeriod
    if (p === 'this_week') {
      result = result.filter(r => r.period === 'today' || r.period === 'yesterday' || r.period === 'this_week')
    } else if (p === 'last_week') {
      result = result.filter(r => r.period === 'last_week')
    } else if (p === 'this_month') {
      result = result.filter(r => r.dateStr.startsWith(THIS_MONTH_PREFIX))
    } else if (p === 'last_month') {
      result = result.filter(r => r.dateStr.startsWith(LAST_MONTH_PREFIX))
    } else {
      result = result.filter(r => r.period === p)
    }
  }
  if (opts?.filterWeekday !== undefined && opts.filterWeekday >= 0) {
    result = result.filter(r => r.weekday === opts.filterWeekday)
  }
  if (opts?.filterDate) {
    result = result.filter(r => r.dateStr === opts.filterDate)
  }

  return [...result].sort((a, b) => {
    const ia = types.indexOf(a.type)
    const ib = types.indexOf(b.type)
    if (ia !== ib) return ia - ib
    return b.time.localeCompare(a.time)
  })
}
