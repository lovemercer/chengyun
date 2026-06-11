<script setup lang="ts">
import DashboardPanel from '../DashboardPanel.vue'
import { useDetailModal } from '../../composables/useDetailModal'

const { openCompare } = useDetailModal()

const rows = [
  {
    label: '今日 vs 昨日',
    v1: 236,
    v2: 257,
    pct: 6.17,
    dir: 'down',
    left: { title: '今日', filterPeriod: 'today' },
    right: { title: '昨日', filterPeriod: 'yesterday' }
  },
  {
    label: '本周 vs 上周',
    v1: 1568,
    v2: 1402,
    pct: 11.83,
    dir: 'up',
    left: { title: '本周', filterPeriod: 'this_week' },
    right: { title: '上周', filterPeriod: 'last_week' }
  },
  {
    label: '本月 vs 上月',
    v1: 6821,
    v2: 7152,
    pct: 4.66,
    dir: 'down',
    left: { title: '本月', filterPeriod: 'this_month' },
    right: { title: '上月', filterPeriod: 'last_month' }
  }
]
</script>

<template>
  <DashboardPanel title="同比环比分析">

    <div class="compare-grid">

      <div
        v-for="item in rows"
        :key="item.label"
        class="compare-card"
        @click="openCompare({ title: `详情 - ${item.label}`, left: item.left, right: item.right })"
      >
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

  cursor: pointer;
  transition: border-color .2s, background .2s;
}

.compare-card:hover {
  border-color: rgba(0, 229, 255, .5);
  background:
    linear-gradient(180deg,
      rgba(0, 40, 90, .35),
      rgba(0, 20, 50, .20));
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
  color: #94A3B8;

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

  color: #94A3B8;

  font-weight: 400;
}

.compare-rate {
  font-size: 20px;

  font-weight: 700;
}

.compare-rate.up {
  color: #22C55E;
}

.compare-rate.down {
  color: #EF4444;
}
</style>