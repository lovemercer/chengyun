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
const { fetchAreaTrend } = useEventQuery()

interface LegendItem {
  name: string
  color: string
  data: number[]
}

const dates = ref<string[]>([])
const legends = ref<LegendItem[]>([])

onMounted(async () => {
  const data = await fetchAreaTrend()
  dates.value = data.dates
  legends.value = data.legends

  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',

    animation: !prefersReducedMotion.value,

    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,20,40,.95)',
      borderColor: '#00e5ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },

    legend: {
      top: 0,

      itemWidth: 12,
      itemHeight: 8,

      textStyle: {
        color: '#F8FAFC',
        fontSize: 12
      },

      data: legends.value.map(item => item.name)
    },

    grid: {
      left: '8%',
      right: '5%',
      top: '18%',
      bottom: '10%'
    },

    xAxis: {
      type: 'category',

      data: dates.value,

      boundaryGap: false,

      axisLine: {
        lineStyle: {
          color: 'rgba(0,229,255,.3)'
        }
      },

      axisTick: {
        show: false
      },

      axisLabel: {
        color: '#94A3B8',
        fontSize: 12
      }
    },

    yAxis: {
      type: 'value',

      splitNumber: 4,

      axisLine: {
        show: false
      },

      axisTick: {
        show: false
      },

      axisLabel: {
        color: '#94A3B8',
        fontSize: 12
      },

      splitLine: {
        lineStyle: {
          color: 'rgba(0,229,255,.12)',
          type: 'dashed'
        }
      }
    },

    series: legends.value.map(item => ({
      name: item.name,

      type: 'line',

      smooth: true,

      symbol: 'circle',

      symbolSize: 6,

      data: item.data,

      lineStyle: {
        width: 2,
        color: item.color
      },

      itemStyle: {
        color: item.color
      },

      areaStyle: {
        color: new echarts.graphic.LinearGradient(
          0,
          0,
          0,
          1,
          [
            {
              offset: 0,
              color: item.color + '55'
            },
            {
              offset: 1,
              color: item.color + '00'
            }
          ]
        )
      }
    }))
  }

  chartInstance.setOption(option)

  // 点击图表区域，根据 x 坐标判断点击的是哪一天
  chartInstance.getZr().on('click', (params: { offsetX: number; offsetY: number }) => {
    const pointInGrid = chartInstance!.convertFromPixel('grid', [params.offsetX, params.offsetY])
    if (!pointInGrid) return

    const idx = Math.round(pointInGrid[0])
    if (idx < 0 || idx >= dates.value.length) return

    openRecords({
      title: `详情 - ${dates.value[idx]} 全部事件`,
      filterDate: dates.value[idx]
    })
  })

  window.addEventListener('resize', resize)
})

const resize = () => {
  chartInstance?.resize()
}

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chartInstance?.dispose()
})
</script>

<template>
  <DashboardPanel title="事件区域分布（近7天）">

    <div ref="chartRef" class="chart" />

  </DashboardPanel>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
