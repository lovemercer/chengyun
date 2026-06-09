<script setup lang="ts">
import DashboardPanel from '../DashboardPanel.vue'

const rows = [
  {
    label: '今日 vs 昨日',
    v1: 236,
    v2: 257,
    pct: 6.17,
    dir: 'down'
  },
  {
    label: '本周 vs 上周',
    v1: 1568,
    v2: 1402,
    pct: 11.83,
    dir: 'up'
  },
  {
    label: '本月 vs 上月',
    v1: 6821,
    v2: 7152,
    pct: 4.66,
    dir: 'down'
  }
]
</script>

<template>
  <DashboardPanel title="同比环比分析">

    <div class="compare-grid">

      <div v-for="item in rows" :key="item.label" class="compare-card">
        <div class="compare-title">
          {{ item.label }}
        </div>

        <div class="compare-value">
          {{ item.v1.toLocaleString() }}

          <span>
            vs {{ item.v2.toLocaleString() }}
          </span>
        </div>

        <div class="compare-rate" :class="item.dir">
          {{ item.dir === 'up' ? '↑' : '↓' }}
          {{ item.pct }}%
        </div>

      </div>

    </div>

  </DashboardPanel>
</template>

<style scoped>
.compare-grid {
  height: 100%;

  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 8px;
}

.compare-card {
  position: relative;

  padding: 24px 18px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  border-radius: 6px;

  border: 1px solid rgba(0, 180, 255, .25);

  background:
    linear-gradient(180deg,
      rgba(0, 40, 90, .22),
      rgba(0, 20, 50, .10));

  overflow: hidden;
}

/* .compare-card::before {
  content: '';

  position: absolute;

  left: 0;
  top: 0;

  width: 2px;
  height: 100%;

  background: #00d8ff;
} */

.compare-title {
  color: #dff7ff;

  font-size: 20px;

  line-height: 1;
}

.compare-value {
  color: #ffffff;

  font-size: 20px;
  font-weight: 600;

  line-height: 1.2;
}

.compare-value span {
  margin-left: 4px;

  font-size: 16px;

  color: #8ecfff;

  font-weight: 400;
}

.compare-rate {
  font-size: 20px;

  font-weight: 700;
}

.compare-rate.up {
  color: #ff5252;
}

.compare-rate.down {
  color: #00ff66;
}
</style>