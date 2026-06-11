<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import DashboardPanel from '../DashboardPanel.vue'
import { useReducedMotion } from '../../composables/useReducedMotion'
import { useDetailModal } from '../../composables/useDetailModal'

const chartRef = ref<HTMLDivElement>()

let chartInstance: echarts.ECharts | null = null

const { prefersReducedMotion } = useReducedMotion()
const { openCompare } = useDetailModal()

const days = [
  '周一',
  '周二',
  '周三',
  '周四',
  '周五',
  '周六',
  '周日'
]

// 当前星期几（0=周一 … 6=周日）
const today = new Date()
const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1

// 本周：已过的天有数据，未来的天显示 0
const thisWeekRaw = [420, 580, 510, 460, 390, 560, 630]
const thisWeek = thisWeekRaw.map((v, i) => i <= todayIdx ? v : 0)

// 上周全部有数据
const lastWeek = [560, 460, 710, 610, 360, 630, 510]

onMounted(() => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',

    animation: !prefersReducedMotion.value,

    tooltip: {
      trigger: 'axis',

      axisPointer: {
        type: 'shadow'
      },

      backgroundColor: 'rgba(0,20,40,.95)',

      borderColor: '#00e5ff',

      borderWidth: 1,

      textStyle: {
        color: '#fff'
      }
    },

    legend: {
      top: 0,
      right: 0,

      itemWidth: 12,
      itemHeight: 8,

      textStyle: {
        color: '#F8FAFC',
        fontSize: 12
      },

      data: ['本周', '上周']
    },

    grid: {
      left: '8%',
      right: '5%',
      top: '18%',
      bottom: '10%'
    },

    xAxis: {
      type: 'category',

      data: days,

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

    series: [
      {
        name: '本周',

        type: 'bar',

        data: thisWeek,

        barWidth: '28%',

        itemStyle: {
          borderRadius: [6, 6, 0, 0],

          color: new echarts.graphic.LinearGradient(
            0,
            1,
            0,
            0,
            [
              {
                offset: 0,
                color: '#0077ff'
              },
              {
                offset: 1,
                color: '#00e5ff'
              }
            ]
          )
        }
      },

      {
        name: '上周',

        type: 'bar',

        data: lastWeek,

        barWidth: '28%',

        itemStyle: {
          borderRadius: [6, 6, 0, 0],

          color: new echarts.graphic.LinearGradient(
            0,
            1,
            0,
            0,
            [
              {
                offset: 0,
                color: '#2a4a6b'
              },
              {
                offset: 1,
                color: '#3d6a8a'
              }
            ]
          )
        }
      }
    ]
  }

  chartInstance.setOption(option)

  chartInstance.on('click', (params) => {
    const dayIndex = days.indexOf(params.name as string)
    openCompare({
      title: `详情 - ${params.name}`,
      left: { title: `本周 ${params.name}`, filterPeriod: 'this_week', filterWeekday: dayIndex },
      right: { title: `上周 ${params.name}`, filterPeriod: 'last_week', filterWeekday: dayIndex }
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
  <DashboardPanel title="事件趋势对比">

    <div ref="chartRef" class="chart" />

  </DashboardPanel>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>