<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import DashboardPanel from '../DashboardPanel.vue'
import { useReducedMotion } from '../../composables/useReducedMotion'
import { useDetailModal } from '../../composables/useDetailModal'

const chartRef = ref<HTMLDivElement>()

let chartInstance: echarts.ECharts | null = null

const { prefersReducedMotion } = useReducedMotion()
const { openRecords } = useDetailModal()

const total = 128568

const categories = [
  { name: '小街面商', value: 48836, pct: '38.0%' },
  { name: '垃圾暴露', value: 26999, pct: '21.0%' },
  { name: '占道经营', value: 19285, pct: '15.0%' },
  { name: '人居环境', value: 15428, pct: '12.0%' },
  { name: '乱贴广告', value: 6428, pct: '5.0%' },
  { name: '其他事件', value: 11592, pct: '9.0%' }
]

const colors = [
  '#2f7cff',
  '#25d8f5',
  '#ffc928',
  '#ffb000',
  '#7f63ff',
  '#9a68ff'
]

onMounted(() => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',

    animation: !prefersReducedMotion.value,

    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,20,40,.95)',
      borderColor: '#00e5ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },

    graphic: [
      {
        type: 'text' as const,
        left: 'center',
        top: '42%',
        style: {
          text: '事件总数',
          textAlign: 'center' as const,
          fill: '#8fdfff',
          fontSize: 15,
          fontWeight: 500
        }
      },
      {
        type: 'text' as const,
        left: 'center',
        top: '52%',
        style: {
          text: total.toLocaleString(),
          textAlign: 'center' as const,
          fill: '#ffffff',
          fontSize: 26,
          fontWeight: 700
        }
      }
    ],

    series: [
      {
        type: 'pie',

        radius: ['65%', '92%'],

        center: ['50%', '50%'],

        avoidLabelOverlap: false,

        label: {
          show: false
        },

        labelLine: {
          show: false
        },

        itemStyle: {
          borderWidth: 0
        },

        data: categories.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: colors[index]
          }
        }))
      }
    ]
  }

  chartInstance.setOption(option)

  chartInstance.on('click', (params) => {
    openRecords({
      title: `详情 - ${params.name}`,
      filterType: params.name as string
    })
  })

  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  chartInstance?.resize()
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<template>
  <DashboardPanel title="事件类型占比">
    <div class="chart-container">

      <div ref="chartRef" class="chart" />

      <div class="legend-box">

        <div v-for="(item, index) in categories" :key="item.name" class="legend-row">
          <div class="legend-left">

            <span class="legend-color" :style="{ backgroundColor: colors[index] }" />

            <span class="legend-name">
              {{ item.name }}
            </span>

          </div>

          <span class="legend-value">
            {{ item.pct }}
          </span>
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

  padding: 0 12px;
  box-sizing: border-box;
}

/* 饼图区域 */
.chart {
  width: 62%;
  min-width: 260px;

  height: 100%;
}

/* 图例区域 */
.legend-box {
  width: 38%;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 每行 */
.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 34px;

  margin-bottom: 4px;
}

/* 左侧 */
.legend-left {
  display: flex;
  align-items: center;

  gap: 10px;
}

/* 色块 */
.legend-color {
  width: 12px;
  height: 12px;

  border-radius: 3px;

  
}

/* 名称 */
.legend-name {
  color: #F8FAFC;

  font-size: 14px;

  white-space: nowrap;
}

/* 百分比 */
.legend-value {
  color: #F8FAFC;

  font-size: 15px;

  font-weight: 700;
}

/* 大屏优化 */
@media screen and (min-width: 1920px) {
  .legend-name {
    font-size: 15px;
  }

  .legend-value {
    font-size: 16px;
  }

  .chart {
    min-width: 300px;
  }
}
</style>