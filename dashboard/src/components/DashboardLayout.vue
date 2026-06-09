<script setup lang="ts">
import HeaderBar from './HeaderBar.vue'
import KPICard from './KPICard.vue'

import EventCategoryChart from './left/EventCategoryChart.vue'
import RankingList from './left/RankingList.vue'
import GrowthAnalysis from './left/GrowthAnalysis.vue'

import AreaDistribution from './right/AreaDistribution.vue'
import TrendComparison from './right/TrendComparison.vue'
import LatestCaptures from './right/LatestCaptures.vue'
</script>

<template>
  <div class="main-container">

    <div class="overlay-grid"></div>

    <!-- Header -->
    <HeaderBar />

    <!-- KPI -->
    <section class="kpi-grid">

      <KPICard label="事件总数 (累计)" value="128,568" change="12.6%" change-type="up" change-label="较昨日">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" class="kpi-svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00e5ff" />
                <stop offset="100%" stop-color="#0066ff" />
              </linearGradient>
            </defs>

            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#grad1)" fill-opacity="0.25" stroke="#00e5ff"
              stroke-width="1.5" />

            <path d="M2 12L12 17L22 12" stroke="#00e5ff" stroke-width="1.5" />

            <path d="M2 17L12 22L22 17" stroke="#00e5ff" stroke-width="1.5" />
          </svg>
        </template>
      </KPICard>

      <KPICard label="今日新增事件" value="236" change="8.3%" change-type="down" change-label="较昨日">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" class="kpi-svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00e5ff" stroke-width="1.5" />

            <path d="M8 12L11 15L16 9" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" />
          </svg>
        </template>
      </KPICard>

      <KPICard label="较昨日变化" value="-8.3%" change="257" change-type="down" change-label="昨日">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" class="kpi-svg green">
            <path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke="#31d158" stroke-width="2.5" stroke-linecap="round" />

            <path d="M22 7V13M22 7H16" stroke="#31d158" stroke-width="2.5" />
          </svg>
        </template>
      </KPICard>

      <KPICard label="近一周事件数" value="1,568" change="11.8%" change-type="up" change-label="环比">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" class="kpi-svg">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="#00e5ff" stroke-width="1.5" />

            <path d="M3 10H21" stroke="#00e5ff" />
            <path d="M8 2V6M16 2V6" stroke="#00e5ff" />
          </svg>
        </template>
      </KPICard>

      <KPICard label="近一月事件数" value="6,821" change="4.6%" change-type="down" change-label="环比">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" class="kpi-svg">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="#00e5ff" stroke-width="1.5" />

            <circle cx="8" cy="13" r="1" fill="#00e5ff" />
            <circle cx="12" cy="13" r="1" fill="#00e5ff" />
            <circle cx="16" cy="13" r="1" fill="#00e5ff" />

            <circle cx="8" cy="17" r="1" fill="#00e5ff" />
            <circle cx="12" cy="17" r="1" fill="#00e5ff" />
            <circle cx="16" cy="17" r="1" fill="#00e5ff" />
          </svg>
        </template>
      </KPICard>

      <KPICard label="近一年事件数" value="82,452" change="9.2%" change-type="up" change-label="同比">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" class="kpi-svg purple">
            <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#818cf8" stroke-width="1.5" />

            <path d="M12 12L21 7" stroke="#818cf8" />
            <path d="M12 12L3 7" stroke="#818cf8" />
          </svg>
        </template>
      </KPICard>

    </section>

    <!-- Main -->
    <main class="dashboard-main">

      <!-- 左侧 -->
      <div class="side-column">

        <div class="panel-item">
          <EventCategoryChart />
        </div>

        <div class="panel-item">
          <RankingList />
        </div>

        <div class="panel-item">
          <GrowthAnalysis />
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

  height: 150px;

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
    24% 1fr 24%;

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