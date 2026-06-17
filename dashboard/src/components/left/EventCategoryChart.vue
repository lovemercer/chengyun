<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import DashboardPanel from '../DashboardPanel.vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useDetailModal } from '@/composables/useDetailModal'
import { useEventQuery } from '@/composables/useEventQuery'

const chartRef = ref<HTMLDivElement>()

let chartInstance: echarts.ECharts | null = null

const { prefersReducedMotion } = useReducedMotion()
const { openRecords } = useDetailModal()
const { fetchCategoryDistribution } = useEventQuery()

interface CategoryItem {
  name: string
  value: number
}

const total = ref(0)
const categories = ref<CategoryItem[]>([])

const colors = [
  '#2F7CFF',
  '#25D8F5',
  '#FFC928',
  '#FF9F43',
  '#7F63FF',
  '#9A68FF',
]

function getPercent(value: number): string {
  return total.value > 0 ? ((value / total.value) * 100).toFixed(1) + '%' : '0%'
}

const renderChart = () => {
  if (!chartInstance) return

  chartInstance.setOption({
    backgroundColor: 'transparent',
    animation: !prefersReducedMotion.value,

    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,20,40,.95)',
      borderColor: '#00E5FF',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: (params: any) => `
        <div>
          <div>${params.name}</div>
          <div>数量：${params.value.toLocaleString()}</div>
          <div>占比：${getPercent(params.value)}</div>
        </div>
      `,
    },

    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: {
          text: '事件总数',
          textAlign: 'center',
          fill: '#8FDFFF',
          fontSize: 13,
          fontWeight: 500,
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '50%',
        style: {
          text: total.value.toLocaleString(),
          textAlign: 'center',
          fill: '#FFFFFF',
          fontSize: 18,
          fontWeight: 700,
        },
      },
    ],

    series: [
      {
        type: 'pie',
        radius: ['55%', '82%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 0 },
        emphasis: { scale: true, scaleSize: 6 },
        data: categories.value.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: colors[index % colors.length] },
        })),
      },
    ],
  })
}

const handleResize = () => chartInstance?.resize()

function handlePieClick(params: any) {
  openRecords({
    title: `详情 - ${params.name}`,
    filterType: params.name,
  })
}

function handleLegendClick(item: CategoryItem) {
  openRecords({
    title: `详情 - ${item.name}`,
    filterType: item.name,
  })
}

onMounted(async () => {
  const data = await fetchCategoryDistribution()
  total.value = data.total
  categories.value = data.categories

  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  renderChart()
  chartInstance.on('click', handlePieClick)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <DashboardPanel title="事件类型占比">
    <div class="chart-container">

      <!-- 饼图 -->
      <div ref="chartRef" class="chart" />

      <!-- 自定义图例（CSS 滚动条，无翻页） -->
      <div class="legend-scroll">
        <div
          v-for="(item, index) in categories"
          :key="item.name"
          class="legend-row"
          @click="handleLegendClick(item)"
        >
          <span
            class="legend-dot"
            :style="{ backgroundColor: colors[index % colors.length] }"
          />
          <span class="legend-name">{{ item.name }}</span>
          <span class="legend-pct">{{ getPercent(item.value) }}</span>
        </div>
      </div>

    </div>
  </DashboardPanel>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
}

/* 饼图 */
.chart {
  width: 46%;
  height: 100%;
  flex-shrink: 0;
}

/* 自定义图例 —— 滚动条 */
.legend-scroll {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 4px 8px 8px;
}

/* 滚动条美化 */
.legend-scroll::-webkit-scrollbar {
  width: 4px;
}
.legend-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.legend-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, .25);
  border-radius: 2px;
}
.legend-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 229, 255, .45);
}

/* 每行 */
.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  transition: background .15s;
}
.legend-row:hover {
  background: rgba(0, 229, 255, .08);
}

/* 色点 */
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* 名称 */
.legend-name {
  flex: 1;
  color: #F8FAFC;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 百分比 */
.legend-pct {
  color: #94A3B8;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 42px;
  text-align: right;
}
</style>
