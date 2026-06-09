<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import DashboardPanel from '../DashboardPanel.vue'

const chartRef = ref<HTMLDivElement>()

let chartInstance: echarts.ECharts | null = null

const dates = [
  '05-21',
  '05-22',
  '05-23',
  '05-24',
  '05-25',
  '05-26',
  '05-27'
]

const legends = [
  {
    name: '小街面商',
    color: '#1e80ff',
    data: [850, 1100, 980, 1350, 1100, 1280, 1150]
  },
  {
    name: '垃圾暴露',
    color: '#24d8e8',
    data: [520, 600, 550, 720, 600, 680, 630]
  },
  {
    name: '车辆违停',
    color: '#ffb300',
    data: [280, 320, 300, 380, 330, 350, 340]
  },
  {
    name: '人居环境',
    color: '#7c5cff',
    data: [420, 480, 450, 520, 490, 510, 500]
  }
]

onMounted(() => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',

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
        color: '#d9f8ff',
        fontSize: 12
      },

      data: legends.map(item => item.name)
    },

    grid: {
      left: '8%',
      right: '5%',
      top: '18%',
      bottom: '10%'
    },

    xAxis: {
      type: 'category',

      data: dates,

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

    series: legends.map(item => ({
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