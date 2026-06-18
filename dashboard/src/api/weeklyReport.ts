/** 周报数据结构定义 */

export type ReportNumber = number | string

export interface AlgorithmRow {
  seq: number
  type: string
  cameras: ReportNumber
  events: number
  accuracy: string
  remark: string
}

export interface WeeklyReportData {
  /** 报告周期，如 "2026年5月30日-2026年6月5日" */
  reportPeriod: string
  /** 填报单位 */
  reportUnit: string
  /** 填报日期 */
  reportDate: string

  // 一、总体概况
  newCameras: ReportNumber
  totalCameras: ReportNumber
  totalAlerts: number
  accuracy: string

  // 二、算法明细表
  algorithms: AlgorithmRow[]

  // 三、告警事件分析
  distributionSummary: string
  keyEventsSummary: string

  // 四、准确率分析
  overallAccuracy: string
  accuracyDirection: string
  accuracyChange: string
  falsePositives: ReportNumber
  falseNegatives: ReportNumber
  optimizationMeasures: string

  // 五、问题与计划
  problems: string
  nextWeekPlan: string
}
