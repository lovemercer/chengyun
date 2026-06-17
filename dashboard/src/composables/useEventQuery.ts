/**
 * 事件查询/统计 composable（主入口）
 *
 * 统计类查询 → statisticQueries.ts
 * 列表类查询 → listQueries.ts
 * 工具/常量   → queryHelpers.ts
 */

export { ES_INDEX, F_TIME, F_TYPE } from './queryHelpers'

import {
  fetchKpiStats,
  fetchCategoryDistribution,
  fetchRanking,
  fetchWeekComparison,
  fetchAreaTrend,
} from './statisticQueries'

import {
  fetchLatestCaptures,
  fetchDetailRecords,
} from './listQueries'

export function useEventQuery() {
  return {
    fetchKpiStats,
    fetchCategoryDistribution,
    fetchRanking,
    fetchWeekComparison,
    fetchAreaTrend,
    fetchLatestCaptures,
    fetchDetailRecords,
  }
}
