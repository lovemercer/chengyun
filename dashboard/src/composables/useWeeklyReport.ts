import { ref } from 'vue'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import type { WeeklyReportData } from '@/api/weeklyReport'
import { fetchWeeklyReportData } from './weeklyReportData'

export function useWeeklyReport() {
  const exporting = ref(false)

  /**
   * 加载模板文件并填充数据，触发浏览器下载。
   * 直接使用 XML 替换方案，绕过 docxtemplater 对模板格式的严格要求。
   * @param data  可传入自定义数据；缺省时从真实接口聚合周报数据。
   */
  async function exportReport(data?: WeeklyReportData) {
    exporting.value = true
    try {
      const reportData = data ?? await fetchWeeklyReportData()
      console.log('[周报] 数据准备完成, keys:', Object.keys(reportData))

      // 1. 加载模板
      const resp = await fetch('/templates/AI赋能周报模板.docx')
      if (!resp.ok) throw new Error(`模板加载失败: ${resp.status}`)
      const buffer = await resp.arrayBuffer()
      console.log('[周报] 模板加载完成, size:', buffer.byteLength)

      // 2. 直接用 XML 替换方案填充数据
      manualExport(reportData, buffer)
    } catch (err) {
      console.error('周报导出失败:', err)
      alert('周报导出失败，请查看控制台日志')
    } finally {
      exporting.value = false
    }
  }

  return { exporting, exportReport }
}

/**
 * 手动 XML 替换方案：直接操作 document.xml 文本。
 * 关键：先去掉 XML 中 <w:r> 标签的拆分，还原连续文本后再做正则替换。
 */
function manualExport(data: WeeklyReportData, templateBuffer: ArrayBuffer) {
  const zip = new PizZip(templateBuffer)
  let xml = zip.file('word/document.xml')!.asText()

  // ── 第 1 步：把被 Word 拆分到多个 <w:r> 里的占位符重新拼合 ──
  xml = mergeSplitRuns(xml)

  // ── 第 2 步：先展开表格循环 ──
  // 注意：必须先处理循环，因为 {accuracy} 同时存在于循环内外，
  // 先做简单替换会把循环内的 {accuracy} 也替换掉
  xml = expandAlgorithmRows(xml, data.algorithms)

  // ── 第 3 步：简单标签替换（循环已展开，不会误伤） ──
  const textReplacements: Record<string, string | number> = {
    reportPeriod: data.reportPeriod,
    reportUnit: data.reportUnit,
    reportDate: data.reportDate,
    newCameras: data.newCameras,
    totalCameras: data.totalCameras,
    totalAlerts: data.totalAlerts,
    accuracy: data.accuracy,
    distributionSummary: data.distributionSummary,
    keyEventsSummary: data.keyEventsSummary,
    overallAccuracy: data.overallAccuracy,
    accuracyDirection: data.accuracyDirection,
    accuracyChange: data.accuracyChange,
    falsePositives: data.falsePositives,
    falseNegatives: data.falseNegatives,
    optimizationMeasures: data.optimizationMeasures,
    nextWeekPlan: data.nextWeekPlan,
  }

  xml = replacePercentPlaceholder(xml, 'accuracy', data.accuracy)
  xml = replacePercentPlaceholder(xml, 'overallAccuracy', data.overallAccuracy)
  xml = replacePercentPlaceholder(xml, 'accuracyChange', data.accuracyChange)
  xml = replaceUnitPlaceholder(xml, 'newCameras', data.newCameras, '路')
  xml = replaceUnitPlaceholder(xml, 'totalCameras', data.totalCameras, '路')
  xml = replaceUnitPlaceholder(xml, 'falsePositives', data.falsePositives, '起')
  xml = replaceUnitPlaceholder(xml, 'falseNegatives', data.falseNegatives, '起')

  for (const [key, val] of Object.entries(textReplacements)) {
    xml = xml.replace(new RegExp(`\\{${key}\\}`, 'g'), escapeXml(String(val)))
  }

  if (!isNumericText(String(data.overallAccuracy).trim())) {
    xml = xml.replace(/整体运行状态良好/g, '相关指标正在按流程核验')
  }

  // problems 字段需要保留换行为 <w:br/>（XML 标签，不能转义）
  xml = xml.replace(/\{problems\}/g, escapeXml(data.problems).replace(/\n/g, '<w:br/>'))

  zip.file('word/document.xml', xml)

  const blob = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  const period = data.reportPeriod ?? '未知周期'
  const filename = `AI赋能周报_${period.replace(/年|月/g, '-').replace(/日/g, '')}.docx`
  saveAs(blob, filename)
  console.log('[周报] 导出成功:', filename)
}

/**
 * 合并被 Word 拆分到多个 <w:r> 运行中的文本。
 * Word 编辑模板时会按格式变化拆分 run，导致 {reportPeriod} 变成：
 *   <w:r><w:rPr>...</w:rPr><w:t>{report</w:t></w:r>
 *   <w:r><w:rPr>...</w:rPr><w:t>Period}</w:t></w:r>
 * 本函数将这些拆分的文本重新合并到同一个 <w:t> 中。
 */
function mergeSplitRuns(xml: string): string {
  const runRegex = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g
  const runs: { full: string; rPr: string; tContent: string }[] = []

  let m: RegExpExecArray | null
  while ((m = runRegex.exec(xml)) !== null) {
    const inner = m[1]
    const rPrMatch = inner.match(/<w:rPr[\s\S]*?<\/w:rPr>/)
    const tMatch = inner.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/)
    if (tMatch) {
      runs.push({
        full: m[0],
        rPr: rPrMatch ? rPrMatch[0] : '',
        tContent: tMatch[1],
      })
    }
  }

  let result = xml
  // 从后往前合并，避免索引偏移
  for (let i = runs.length - 2; i >= 0; i--) {
    const curr = runs[i]
    const next = runs[i + 1]

    // 当前 run 文本含未闭合的 { ，下一个 run 文本含 }
    if (
      curr.tContent.includes('{') &&
      !curr.tContent.includes('}') &&
      next.tContent.includes('}')
    ) {
      const mergedText = curr.tContent + next.tContent
      const mergedRun = `<w:r>${curr.rPr}<w:t xml:space="preserve">${escapeXml(mergedText)}</w:t></w:r>`

      result = result.replace(curr.full + next.full, mergedRun)

      // 更新 runs[i] 以支持连续多段拆分
      curr.tContent = mergedText
      curr.full = mergedRun
    }
  }

  return result
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function expandAlgorithmRows(xml: string, algorithms: WeeklyReportData['algorithms']): string {
  const rowRegex = /<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g
  const rowMatch = Array.from(xml.matchAll(rowRegex))
    .find(match => match[0].includes('{#algorithms}') && match[0].includes('{/algorithms}'))

  if (!rowMatch) {
    throw new Error('模板缺少 algorithms 表格循环占位符')
  }

  const fullRow = rowMatch[0]
  const openingTag = fullRow.match(/^<w:tr\b[^>]*>/)?.[0] ?? '<w:tr>'
  const rowTemplate = fullRow
    .slice(openingTag.length, -'</w:tr>'.length)
    .replace(/\{#algorithms\}/g, '')
    .replace(/\{\/algorithms\}/g, '')

  const expandedRows = algorithms.map(algo => {
    let row = rowTemplate
    row = row.replace(/\{seq\}/g, String(algo.seq))
    row = row.replace(/\{type\}/g, escapeXml(algo.type))
    row = row.replace(/\{cameras\}/g, escapeXml(String(algo.cameras)))
    row = row.replace(/\{events\}/g, String(algo.events))
    row = row.replace(/\{accuracy\}/g, escapeXml(algo.accuracy))
    row = row.replace(/\{remark\}/g, escapeXml(algo.remark))
    return `${openingTag}${row}</w:tr>`
  }).join('')

  return xml.replace(fullRow, expandedRows)
}

function replacePercentPlaceholder(xml: string, key: string, value: string): string {
  const rawValue = value.trim()
  const replacement = rawValue.endsWith('%')
    ? rawValue
    : isNumericText(rawValue)
      ? `${rawValue}%`
      : rawValue

  return xml.replace(new RegExp(`\\{${key}\\}%`, 'g'), escapeXml(replacement))
}

function replaceUnitPlaceholder(
  xml: string,
  key: string,
  value: string | number,
  unit: string,
): string {
  const rawValue = String(value).trim()
  const replacement = isNumericText(rawValue) ? `${rawValue}${unit}` : rawValue
  return xml.replace(new RegExp(`\\{${key}\\}${unit}`, 'g'), escapeXml(replacement))
}

function isNumericText(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value)
}
