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
const { fetchRanking } = useEventQuery()

interface RankItem {
  name: string
  count: number
}

const items = ref<RankItem[]>([])
const total = ref(0)

onMounted(async () => {
  const data = await fetchRanking(5)
  items.value = data.items
  total.value = data.total

  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',

    animation: !prefersReducedMotion.value,

    grid: {
      left: '18%',
      right: '18%',
      top: '6%',
      bottom: '6%'
    },

    xAxis: {
      type: 'value',
      show: false
    },

    yAxis: {
      type: 'category',
      inverse: true,

      data: items.value.map(item => item.name),

      axisLine: {
        show: false
      },

      axisTick: {
        show: false
      },

      axisLabel: {
        color: '#94A3B8',
        fontSize: 14
      }
    },

    series: [
      {
        type: 'bar',

        barWidth: 10,

        data: items.value.map(item => item.count),

        itemStyle: {
          borderRadius: [0, 6, 6, 0],

          color: new echarts.graphic.LinearGradient(
            0,
            0,
            1,
            0,
            [
              {
                offset: 0,
                color: '#1e80ff'
              },
              {
                offset: 1,
                color: '#24d8e8'
              }
            ]
          )
        },

        label: {
          show: true,

          position: 'right',

          color: '#ffffff',

          fontSize: 14,

          formatter: (params: any) =>
            params.value.toLocaleString()
        }
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
  <DashboardPanel title="事件类型TOP5">

    <template #extra>
      <span class="total-text">
        累计：{{ total.toLocaleString() }}
      </span>
    </template>

    <div ref="chartRef" class="chart" />

  </DashboardPanel>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}

.total-text {
  color: #94A3B8;

  font-size: 14px;

  font-weight: 500;
}
</style>
