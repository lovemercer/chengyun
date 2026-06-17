/**
 * groupBy 按时间分组测试
 *
 * 目的：测试 statisticEvents 能不能通过 groupBy
 *      一次返回多天的数据，减少调用次数
 */

import { statisticEvents } from './event'

const ES = 'eventlib.city_management'
const FT = 'paramsEventsHappenTime'

function pad(n: number, len = 2) {
  return String(n).padStart(len, '0')
}

function tz(): string {
  const off = -new Date().getTimezoneOffset()
  return `${off >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function range(start: Date, end: Date): string {
  return `[${fmt(start)}T00:00:00.000${tz()},${fmt(end)}T23:59:59.999${tz()}]`
}

function log(label: string, res: any) {
  const data = res.data
  console.group(`🧪 ${label}`)
  console.log(`返回条数: ${Array.isArray(data) ? data.length : '?'}`)
  console.log(`前 5 条:`, data.slice(0, 5))
  console.log(`全部:`, data)
  console.groupEnd()
}

export async function runTests() {
  const now = new Date()

  // 本周一
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - dayOfWeek + 1)

  // 本月1号
  const month1st = new Date(now.getFullYear(), now.getMonth(), 1)

  const base = {
    returnFields: '*',
    eventName: ES,
    maxRows: 200,
    fieldOptions: [] as any[],
    aggCols: [] as any[],
    groupByCols: '',
  }

  console.log('========================================')
  console.log('  groupBy 时间分组测试')
  console.log(`  今天: ${fmt(now)}, 周一: ${fmt(mon)}, 月初: ${fmt(month1st)}`)
  console.log('========================================')

  // ── 1. 本周 + groupBy happenTime ──
  const r1 = await statisticEvents({
    ...base,
    fieldOptions: [{ fieldName: FT, value: range(mon, now), type: 'timeRange' }],
    groupByCols: 'paramsEventsHappenTime',
  } as any)
  log('1. 本周 + groupBy paramsEventsHappenTime', r1)

  // ── 2. 本周 + groupBy warehouseTime ──
  const r2 = await statisticEvents({
    ...base,
    fieldOptions: [{ fieldName: FT, value: range(mon, now), type: 'timeRange' }],
    groupByCols: 'sys_exclusive_warehouseTime',
  } as any)
  log('2. 本周 + groupBy sys_exclusive_warehouseTime', r2)

  // ── 3. 本月 + 按天分组 ──
  const r3 = await statisticEvents({
    ...base,
    maxRows: 500,
    fieldOptions: [{ fieldName: FT, value: range(month1st, now), type: 'timeRange' }],
    groupByCols: 'paramsEventsHappenTime',
  } as any)
  log('3. 本月 + groupBy paramsEventsHappenTime', r3)

  // ── 4. 本月 + 按类型分组（对比用） ──
  const r4 = await statisticEvents({
    ...base,
    maxRows: 200,
    fieldOptions: [{ fieldName: FT, value: range(month1st, now), type: 'timeRange' }],
    groupByCols: 'sys_exclusive_eventTypeName',
  } as any)
  log('4. 本月 + groupBy 事件类型（对比）', r4)

  console.log('========================================')
  console.log('  看返回条数 — 如果按天分组能返回每一条就对了')
  console.log('========================================')
}
