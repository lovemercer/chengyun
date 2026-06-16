/** 周报数据接口定义 */

export interface AlgorithmRow {
  seq: number
  type: string
  cameras: number
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

  // ── 一、总体概况 ──
  newCameras: number
  totalCameras: number
  totalAlerts: number
  accuracy: string

  // ── 二、算法明细表 ──
  algorithms: AlgorithmRow[]

  // ── 三、告警事件分析 ──
  distributionSummary: string
  keyEventsSummary: string

  // ── 四、准确率分析 ──
  overallAccuracy: string
  accuracyDirection: string
  accuracyChange: string
  falsePositives: number
  falseNegatives: number
  optimizationMeasures: string

  // ── 五、问题与计划 ──
  problems: string
  nextWeekPlan: string
}

// ── 日期工具 ──────────────────────────
function formatDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function getWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setDate(now.getDate() + diffToMon)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return { start: mon, end: sun }
}

// ── Mock 数据生成 ──────────────────────────
export function generateMockReport(): WeeklyReportData {
  const { start, end } = getWeekRange()
  const now = new Date()

  const algorithmTypes = [
    { type: '非法摆摊', cameras: 34, events: 2680 },
    { type: '道路积水', cameras: 7, events: 2 },
    { type: '烟火检测', cameras: 3, events: 0 },
    { type: '占道经营', cameras: 9, events: 409 },
    { type: '人员聚集', cameras: 5, events: 717 },
    { type: '店外经营', cameras: 2, events: 477 },
  ]

  const totalAlerts = algorithmTypes.reduce((s, a) => s + a.events, 0)
  const totalCameras = algorithmTypes.reduce((s, a) => s + a.cameras, 0)

  return {
    reportPeriod: `${formatDate(start)}-${formatDate(end)}`,
    reportUnit: '中国移动通信集团城东分公司',
    reportDate: formatDate(now),

    newCameras: 7,
    totalCameras,
    totalAlerts,
    accuracy: '99.97',

    algorithms: algorithmTypes.map((a, i) => ({
      seq: i + 1,
      type: a.type,
      cameras: a.cameras,
      events: a.events,
      accuracy: '100%',
      remark: '',
    })),

    distributionSummary:
      `按算法类型分布：本周告警事件中类型占比情况如下：` +
      `非法摆摊2680起，占比62.54%；人员聚集717起，占比16.73%；` +
      `占道经营409起，占比9.54%，店外经营477起，占比11.13%；` +
      `其余类型事件合计2起，占比0.06%。`,

    keyEventsSummary:
      `本周主要告警事件为：非法摆摊2680条，事发地点包含昆仑路梨园路梨园小区南枪052、` +
      `东关大街索麻巷口西枪139、互助路湟中路丁字北西枪368等点位；` +
      `店外经营477条，事发地点包含东关大街嘉年华宾馆门口167；` +
      `占道经营409条，事发地点包含南山路德馨清真综超市009等；` +
      `道路积水2条，事发地点包含昆仑路共和路十字南枪西094；` +
      `人员聚集事件717条，事发地点包含韵家口清真寺社会资源等。`,

    overallAccuracy: '100',
    accuracyDirection: '上升',
    accuracyChange: '0.08',
    falsePositives: 0,
    falseNegatives: 0,
    optimizationMeasures: '对道路积水算法进行参数优化',

    problems:
      '1、道路积水算法存在误判，需进行参数优化，提升算法准确率；\n' +
      '2、AI赋能功能执行存在部分异常，需优化解决。',

    nextWeekPlan: '根据城运中心要求及实际需求，增加赋能点位，以及对赋能点位进行算法参数及类型优化。',
  }
}
