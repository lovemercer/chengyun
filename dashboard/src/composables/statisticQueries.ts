/**
 * 统计类查询（全部走 API 6: statisticEvents）
 */

import { statisticEvents, queryEvents } from '@/api/event'
import { useEventData } from './useEventData'
import {
  ES_INDEX,
  F_TIME,
  F_TYPE,
  timeRange,
  dateRange,
  daysAgo,
  weekRange,
  monthRange,
  yearRange,
  makeStatParams,
  getCount,
} from './queryHelpers'

// ============================================================
// KPI 指标
// ============================================================

export async function fetchKpiStats() {
  const now = new Date()
  const week = weekRange(now)
  const month = monthRange(now)
  const year = yearRange(now)

  const [
    resTotal, resToday, resYesterday, resDayBefore,
    resWeek, resLastWeek,
    resMonth, resLastMonth,
    resYear, resLastYear,
  ] = await Promise.all([
    statisticEvents(makeStatParams()),
    statisticEvents(makeStatParams({ timeFilter: timeRange(now) })),
    statisticEvents(makeStatParams({ timeFilter: timeRange(daysAgo(1)) })),
    statisticEvents(makeStatParams({ timeFilter: timeRange(daysAgo(2)) })),
    statisticEvents(makeStatParams({ timeFilter: dateRange(week.thisStart, week.thisEnd) })),
    statisticEvents(makeStatParams({ timeFilter: dateRange(week.lastStart, week.lastEnd) })),
    statisticEvents(makeStatParams({ timeFilter: dateRange(month.thisStart, month.thisEnd) })),
    statisticEvents(makeStatParams({ timeFilter: dateRange(month.lastStart, month.lastEnd) })),
    statisticEvents(makeStatParams({ timeFilter: dateRange(year.thisStart, year.thisEnd) })),
    statisticEvents(makeStatParams({ timeFilter: dateRange(year.lastStart, year.lastEnd) })),
  ])

  const pct = (v: number, prev: number) =>
    prev > 0 ? (((v - prev) / prev) * 100).toFixed(1) + '%'
    : v > 0 ? '100%'
    : '--'
  const s = (n: number) => n.toLocaleString()

  const today = getCount(resToday), yesterday = getCount(resYesterday), dayBefore = getCount(resDayBefore)
  const thisWeek = getCount(resWeek), lastWeek = getCount(resLastWeek)
  const thisMonth = getCount(resMonth), lastMonth = getCount(resLastMonth)
  const thisYear = getCount(resYear), lastYear = getCount(resLastYear)

  const dir = (v: number, prev: number) => (v >= prev ? 'up' : 'down') as 'up' | 'down'

  return {
    total: s(getCount(resTotal)),
    today: s(today),
    todayChange: pct(today, yesterday),
    _todayDir: dir(today, yesterday),
    yesterdayValue: s(yesterday),
    yesterdayChange: pct(yesterday, dayBefore),
    _yesterdayDir: dir(yesterday, dayBefore),
    thisWeek: s(thisWeek),
    thisWeekChange: pct(thisWeek, lastWeek),
    _weekDir: dir(thisWeek, lastWeek),
    thisMonth: s(thisMonth),
    thisMonthChange: pct(thisMonth, lastMonth),
    _monthDir: dir(thisMonth, lastMonth),
    thisYear: s(thisYear),
    thisYearChange: pct(thisYear, lastYear),
    _yearDir: dir(thisYear, lastYear),
    // 原始 count，供 GrowthAnalysis 复用，省 6 次请求
    growth: { today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth },
  }
}

// ============================================================
// 事件类型占比（饼图）
// ============================================================

export async function fetchCategoryDistribution() {
  const { init } = useEventData()
  await init()

  const res = await statisticEvents({
    ...makeStatParams({ maxRows: 100, groupByCols: F_TYPE }),
  })

  const categories = res.data.map((item) => ({
    name: item.value || item.colName || '(空)',
    value: item.count || 0,
  }))

  const total = categories.reduce((sum: number, c) => sum + c.value, 0)

  return { total, categories }
}

// ============================================================
// TOP5 排名
// ============================================================

export async function fetchRanking(topN = 5) {
  const { init, eventTypes } = useEventData()
  await init()

  const keyToName = new Map<string, string>()
  for (const t of eventTypes.value) {
    keyToName.set(t.eventTableIndexCode, t.name)
  }

  const res = await statisticEvents({
    ...makeStatParams({ maxRows: 100, groupByCols: F_TYPE }),
  })

  const nameToCount = new Map<string, number>()
  for (const item of res.data) {
    const cnName = keyToName.get(item.value || item.colName || '') || item.value || item.colName || '未知'
    nameToCount.set(cnName, (nameToCount.get(cnName) || 0) + (item.count || 0))
  }

  const items = Array.from(nameToCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }))

  return { items, total: items.reduce((sum, i) => sum + i.count, 0) }
}

// ============================================================
// 本周 vs 上周趋势对比
// ============================================================

export async function fetchWeekComparison() {
  const now = new Date()
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1

  // 本周一 & 上周一
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() - todayIdx)
  thisMonday.setHours(0, 0, 0, 0)
  const lastMonday = new Date(thisMonday.getTime() - 7 * 86400000)

  // 一次请求拿全两周事件
  const filter = dateRange(lastMonday, now)
  const res = await queryEvents({
    returnFields: F_TIME,
    eventName: ES_INDEX,
    pageNo: 1,
    pageSize: 20000,
    fieldOptions: [{ fieldName: F_TIME, value: filter, type: 'timeRange' }],
  })

  // 初始化桶
  const thisWeek = [0, 0, 0, 0, 0, 0, 0]
  const lastWeek = [0, 0, 0, 0, 0, 0, 0]

  for (const record of res.data.list) {
    const ts = record[F_TIME] as number
    if (!ts) continue

    const d = new Date(ts)
    const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1 // 0=周一

    if (d >= thisMonday) {
      thisWeek[dayIdx]++
    } else {
      lastWeek[dayIdx]++
    }
  }

  return { days, thisWeek, lastWeek }
}

// ============================================================
// 区域分布趋势（近7天）
// ============================================================

export async function fetchAreaTrend() {
  const now = new Date()
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    dates.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }

  // 最早一天的 00:00
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
  start.setHours(0, 0, 0, 0)

  const res = await queryEvents({
    returnFields: [F_TIME, F_TYPE].join(','),
    eventName: ES_INDEX,
    pageNo: 1,
    pageSize: 20000,
    fieldOptions: [{ fieldName: F_TIME, value: dateRange(start, now), type: 'timeRange' }],
  })

  // 按类型 + 按天双维度分桶
  const typeDayMap = new Map<string, number[]>()
  for (const record of res.data.list) {
    const ts = record[F_TIME] as number
    const type = (record[F_TYPE] as string) || '未知'
    if (!ts) continue

    const d = new Date(ts)
    const dayIdx = Math.floor((d.getTime() - start.getTime()) / 86400000)
    if (dayIdx < 0 || dayIdx >= 7) continue

    if (!typeDayMap.has(type)) {
      typeDayMap.set(type, [0, 0, 0, 0, 0, 0, 0])
    }
    typeDayMap.get(type)![dayIdx]++
  }

  // 按总量降序排列
  const colors = ['#1e80ff', '#24d8e8', '#ffb300', '#7c5cff', '#31d158', '#ff6b6b', '#ff922b']
  const legends = Array.from(typeDayMap.entries())
    .sort((a, b) => {
      const sumA = a[1].reduce((s, v) => s + v, 0)
      const sumB = b[1].reduce((s, v) => s + v, 0)
      return sumB - sumA
    })
    .map(([name, data], idx) => ({
      name,
      color: colors[idx % colors.length],
      data,
    }))

  return { dates, legends }
}
