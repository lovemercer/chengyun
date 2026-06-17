<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HeaderBar from './HeaderBar.vue'
import KPICard from './KPICard.vue'

import EventCategoryChart from './left/EventCategoryChart.vue'
import RankingList from './left/RankingList.vue'
import GrowthAnalysis from './left/GrowthAnalysis.vue'

import AreaDistribution from './right/AreaDistribution.vue'
import TrendComparison from './right/TrendComparison.vue'
import LatestCaptures from './right/LatestCaptures.vue'
import DetailModal from './DetailModal.vue'

import { useEventData } from '@/composables/useEventData'
import { useEventQuery } from '@/composables/useEventQuery'
import { useCameraData } from '@/composables/useCameraData'
import type { GrowthData } from './left/GrowthAnalysis.vue'

const { init } = useEventData()
const { fetchKpiStats } = useEventQuery()
const { preload: preloadCameras } = useCameraData()

interface KpiItem {
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  changeLabel?: string
}

const kpis = ref<KpiItem[]>([])
const growthData = ref<GrowthData>({ today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, thisMonth: 0, lastMonth: 0 })
const kpiReady = ref(false)

onMounted(async () => {
  // 事件类型初始化（必要） + 摄像头预加载（后台，不阻塞）
  await init()
  preloadCameras() // 不等结果，后台加载，加载完自动刷新视图
  const stats = await fetchKpiStats()
  growthData.value = stats.growth
  kpis.value = [
    { label: '事件总数 (累计)', value: stats.total },
    { label: '今日新增事件', value: stats.today, change: stats.todayChange, changeType: stats._todayDir, changeLabel: '较昨日' },
    { label: '昨日新增事件', value: stats.yesterdayValue, change: stats.yesterdayChange, changeType: stats._yesterdayDir, changeLabel: '较前日' },
    { label: '近一周事件数', value: stats.thisWeek, change: stats.thisWeekChange, changeType: stats._weekDir, changeLabel: '环比' },
    { label: '近一月事件数', value: stats.thisMonth, change: stats.thisMonthChange, changeType: stats._monthDir, changeLabel: '环比' },
    { label: '近一年事件数', value: stats.thisYear, change: stats.thisYearChange, changeType: stats._yearDir, changeLabel: '同比' },
  ]
  kpiReady.value = true
})
</script>

<template>
  <div class="main-container">

    <div class="overlay-grid"></div>

    <!-- Header -->
    <HeaderBar />

    <!-- KPI -->
    <section class="kpi-grid">

      <KPICard
        v-for="kpi in kpis"
        :key="kpi.label"
        :label="kpi.label"
        :value="kpi.value"
        :change="kpi.change"
        :change-type="kpi.changeType"
        :change-label="kpi.changeLabel"
      />

    </section>

    <!-- Main -->
    <main v-if="kpiReady" class="dashboard-main">

      <!-- 左侧 -->
      <div class="side-column">

        <div class="panel-item">
          <EventCategoryChart />
        </div>

        <div class="panel-item">
          <RankingList />
        </div>

        <div class="panel-item">
          <GrowthAnalysis :data="growthData" />
        </div>

      </div>

      <!-- 中间 -->
      <div class="center-column"></div>

      <!-- 右侧 -->
      <div class="side-column">

        <div class="panel-item">
          <AreaDistribution />
        </div>

        <div class="panel-item">
          <TrendComparison />
        </div>

        <div class="panel-item">
          <LatestCaptures />
        </div>

      </div>

    </main>

    <DetailModal />

  </div>
</template>

<style scoped>
.main-container {
  position: relative;

  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  background: url('/images/bg.png') center center / cover no-repeat;
}

.overlay-grid {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(rgba(0, 10, 30, .35) 0%,
      rgba(0, 10, 30, .1) 50%,
      rgba(0, 10, 30, .55) 100%);

  pointer-events: none;
}

/* KPI */

.kpi-grid {
  position: relative;
  z-index: 10;

  display: grid;

  grid-template-columns: repeat(6, 1fr);

  gap: 18px;

  height: clamp(120px, 14vh, 160px);

  padding: 0 16px;

  align-items: center;
}

.kpi-svg {
  width: 82px;
  height: 82px;

  filter:
    drop-shadow(0 0 8px #00e5ff) drop-shadow(0 0 18px rgba(0, 229, 255, .35));
}

.kpi-svg.green {
  filter:
    drop-shadow(0 0 8px #31d158) drop-shadow(0 0 18px rgba(49, 209, 88, .35));
}

.kpi-svg.purple {
  filter:
    drop-shadow(0 0 8px #818cf8) drop-shadow(0 0 18px rgba(129, 140, 248, .35));
}

/* MAIN */

.dashboard-main {
  flex: 1;

  display: grid;

  grid-template-columns:
    25% 1fr 25%;

  gap: 16px;

  padding: 16px;

  min-height: 0;

  position: relative;
  z-index: 10;
}

.side-column {
  display: flex;
  flex-direction: column;

  gap: 16px;

  min-height: 0;
}

.panel-item {
  flex: 1;
  min-height: 0;
}

.center-column {
  min-height: 0;
}
</style>