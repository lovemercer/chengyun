/**
 * 事件查询/统计 composable
 *
 * 提供看板所有模块所需的数据查询方法。
 * 当前 mock 数据激活，真实接口调用已注释 —— 切换时取消注释即用。
 */

import { ref } from 'vue'
// import { queryEvents, statisticEvents, type QueryParams, type StatisticParams } from '@/api/event'

const loading = ref(false)
const error = ref<string | null>(null)

// ============================================================
// Mock 数据（保持与现有看板一致）
// ============================================================

const mockTypes = ['占道经营', '垃圾暴露', '车辆违停', '人居环境', '乱贴广告', '小街面商', '人员聚集', '乱堆暴露', '其他事件']

const mockLocations = [
  '水木大桥路口', '喜悦广场', '名城·星耀北门', '真如大明城', '东关大街',
  '昆仑路', '建国路', '人民广场', '新华路', '解放大道',
  '和平路', '中山路', '文化街', '站前路', '长江路',
]

const mockCategoryData = [
  { name: '小街面商', value: 48836 },
  { name: '垃圾暴露', value: 26999 },
  { name: '占道经营', value: 19285 },
  { name: '人居环境', value: 15428 },
  { name: '乱贴广告', value: 6428 },
  { name: '其他事件', value: 11592 },
]

const mockTotal = 128568

const mockRankingData = [
  { name: '占道经营', count: 49906 },
  { name: '垃圾暴露', count: 20509 },
  { name: '车辆违停', count: 15528 },
  { name: '人居环境', count: 12654 },
  { name: '乱贴广告', count: 10264 },
]

const mockGrowthData = [
  { label: '今日 vs 昨日', v1: 236, v2: 257, pct: 6.17, dir: 'down' as const },
  { label: '本周 vs 上周', v1: 1568, v2: 1402, pct: 11.83, dir: 'up' as const },
  { label: '本月 vs 上月', v1: 6821, v2: 7152, pct: 4.66, dir: 'down' as const },
]

const mockKpiData = {
  total: '128,568',
  today: '236',
  yesterdayChange: '-8.3%',
  yesterdayValue: '257',
  thisWeek: '1,568',
  thisWeekChange: '11.8%',
  thisMonth: '6,821',
  thisMonthChange: '4.6%',
  thisYear: '82,452',
  thisYearChange: '9.2%',
}

const mockDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const mockThisWeekRaw = [420, 580, 510, 460, 390, 560, 630]
const mockLastWeek = [560, 460, 710, 610, 360, 630, 510]

function getTodayIndex(): number {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

const mockTrendLegends = [
  { name: '小街面商', color: '#1e80ff' },
  { name: '垃圾暴露', color: '#24d8e8' },
  { name: '车辆违停', color: '#ffb300' },
  { name: '人居环境', color: '#7c5cff' },
]

function randData(base: number, range: number): number[] {
  return Array.from({ length: 7 }, () => Math.round(base + Math.random() * range))
}

// ============================================================
// 导出方法
// ============================================================

export function useEventQuery() {
  // ---- KPI ----

  async function fetchKpiStats() {
    // [真实接口]
    // const res = await statisticEvents({ eventName: 'xxx', maxRows: 100, fieldOptions: [...], aggCols: [...], groupByCols: '...' })
    // return processKpiStats(res.data)

    return { ...mockKpiData }
  }

  // ---- 事件类型占比（饼图） ----

  async function fetchCategoryDistribution() {
    // [真实接口]
    // const res = await statisticEvents({
    //   eventName: 'xxx',
    //   maxRows: 100,
    //   fieldOptions: [],
    //   aggCols: [{ name: 'count', aggFunc: 'count' }],
    //   groupByCols: 'eventType',
    // })
    // return res.data.list.map(item => ({ name: item.colName, value: Number(item.value) }))

    return {
      total: mockTotal,
      categories: mockCategoryData,
    }
  }

  // ---- TOP5 排名 ----

  async function fetchRanking(topN = 5) {
    // [真实接口]
    // const res = await statisticEvents({
    //   eventName: 'xxx',
    //   maxRows: topN,
    //   fieldOptions: [],
    //   aggCols: [{ name: 'count', aggFunc: 'count' }],
    //   groupByCols: 'eventType',
    // })
    // return res.data.list.map(item => ({ name: item.colName, count: Number(item.value) }))

    return {
      items: mockRankingData.slice(0, topN),
      total: mockTotal,
    }
  }

  // ---- 同比环比分析 ----

  async function fetchGrowthAnalysis() {
    // [真实接口] - 需要分别查询不同时间段的 count 再计算
    // const today = await statisticEvents({ ...filterByToday... })
    // const yesterday = await statisticEvents({ ...filterByYesterday... })
    // const thisWeek = await statisticEvents({ ...filterByThisWeek... })
    // const lastWeek = await statisticEvents({ ...filterByLastWeek... })
    // const thisMonth = await statisticEvents({ ...filterByThisMonth... })
    // const lastMonth = await statisticEvents({ ...filterByLastMonth... })
    // return calcGrowth(today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth)

    return mockGrowthData.map((item) => ({
      ...item,
      left: { title: item.label.split(' vs ')[0] },
      right: { title: item.label.split(' vs ')[1] },
    }))
  }

  // ---- 事件趋势对比（本周 vs 上周） ----

  async function fetchWeekComparison() {
    // [真实接口]
    // const thisWeek = await statisticEvents({ ...thisWeekGroupByDay... })
    // const lastWeek = await statisticEvents({ ...lastWeekGroupByDay... })

    const todayIdx = getTodayIndex()
    return {
      days: mockDays,
      thisWeek: mockThisWeekRaw.map((v, i) => (i <= todayIdx ? v : 0)),
      lastWeek: mockLastWeek,
    }
  }

  // ---- 事件区域分布（近7天） ----

  async function fetchAreaTrend() {
    // [真实接口]
    // const res = await statisticEvents({ ...groupByDayAndType... })

    function formatDate(d: Date): string {
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    const dates: string[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      dates.push(formatDate(d))
    }

    return {
      dates,
      legends: mockTrendLegends.map((item) => ({
        ...item,
        data: randData(400, 500),
      })),
    }
  }

  // ---- 最新事件抓拍 ----

  async function fetchLatestCaptures(limit = 6) {
    // [真实接口]
    // const res = await queryEvents({
    //   eventName: 'xxx',
    //   pageNo: 1,
    //   pageSize: limit,
    //   sort: [{ method: 'desc', column: 'happenTime' }],
    // })
    // return res.data.list.map(record => ({ id, time, type, location }))

    const now = new Date()
    return Array.from({ length: limit }, (_, i) => {
      const t = new Date(now.getTime() - i * 60000)
      return {
        id: Date.now() - i,
        time: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`,
        type: mockTypes[i % mockTypes.length],
        location: mockLocations[i % mockLocations.length],
      }
    })
  }

  // ---- 详情记录查询 ----

  async function fetchDetailRecords(opts?: {
    filterType?: string
    filterPeriod?: string
    filterDate?: string
    pageNo?: number
    pageSize?: number
  }) {
    // [真实接口]
    // const fieldOptions: FieldOption[] = []
    // if (opts?.filterType) fieldOptions.push({ fieldName: 'eventType', value: opts.filterType, type: 'terms' })
    // if (opts?.filterPeriod) { ...timeRange handling... }
    // const res = await queryEvents({
    //   eventName: 'xxx',
    //   pageNo: opts?.pageNo ?? 1,
    //   pageSize: opts?.pageSize ?? 10,
    //   fieldOptions,
    //   sort: [{ method: 'desc', column: 'happenTime' }],
    // })
    // return { list: res.data.list, total: res.data.total }

    // Mock: 委托给 mockDetail
    const { getDetailRecords } = await import('@/data/mockDetail')
    const records = getDetailRecords({
      filterType: opts?.filterType,
      filterPeriod: opts?.filterPeriod,
      filterDate: opts?.filterDate,
    })

    const pageNo = opts?.pageNo ?? 1
    const pageSize = opts?.pageSize ?? 10
    const start = (pageNo - 1) * pageSize
    const paged = records.slice(start, start + pageSize)

    return {
      list: paged,
      total: records.length,
    }
  }

  // ---- 获取 mock 事件类型列表 ----

  function getMockTypes() {
    return mockTypes
  }

  function getMockLocations() {
    return mockLocations
  }

  return {
    loading,
    error,
    fetchKpiStats,
    fetchCategoryDistribution,
    fetchRanking,
    fetchGrowthAnalysis,
    fetchWeekComparison,
    fetchAreaTrend,
    fetchLatestCaptures,
    fetchDetailRecords,
    getMockTypes,
    getMockLocations,
  }
}
