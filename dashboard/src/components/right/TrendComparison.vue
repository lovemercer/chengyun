<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import DashboardPanel from '../DashboardPanel.vue'

const chartRef = ref<HTMLDivElement>()

let chartInstance: echarts.ECharts | null = null

const days = [
  '周一',
  '周二',
  '周三',
  '周四',
  '周五',
  '周六',
  '周日'
]

const thisWeek = [420, 580, 510, 460, 390, 560, 630]
const lastWeek = [560, 460, 710, 610, 360, 630, 510]

onMounted(() => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',

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
        color: '#d9f8ff',
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
        color: '#9fdfff',
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
        color: '#9fdfff',
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
                color: '#1e80ff'
              },
              {
                offset: 1,
                color: '#39d5ff'
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
                color: '#7c5cff'
              },
              {
                offset: 1,
                color: '#b794ff'
              }
            ]
          )
        }
      }
    ]
  }

  chartInstance.setOption(option)

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