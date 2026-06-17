<script setup lang="ts">
import { computed } from 'vue'
import DashboardPanel from '../DashboardPanel.vue'
import { useDetailModal } from '@/composables/useDetailModal'

export interface GrowthData {
  today: number
  yesterday: number
  thisWeek: number
  lastWeek: number
  thisMonth: number
  lastMonth: number
}

const props = defineProps<{ data: GrowthData }>()

const { openCompare } = useDetailModal()

function calc(v1: number, v2: number) {
  const pct = v2 > 0 ? Math.abs(((v1 - v2) / v2) * 100) : 0
  return { pct: Math.round(pct * 100) / 100, dir: (v1 >= v2 ? 'up' : 'down') as 'up' | 'down' }
}

const rows = computed(() => [
  { label: '今日 vs 昨日', v1: props.data.today, v2: props.data.yesterday, ...calc(props.data.today, props.data.yesterday), left: { title: '今日', filterPeriod: 'today' }, right: { title: '昨日', filterPeriod: 'yesterday' } },
  { label: '本周 vs 上周', v1: props.data.thisWeek, v2: props.data.lastWeek, ...calc(props.data.thisWeek, props.data.lastWeek), left: { title: '本周', filterPeriod: 'this_week' }, right: { title: '上周', filterPeriod: 'last_week' } },
  { label: '本月 vs 上月', v1: props.data.thisMonth, v2: props.data.lastMonth, ...calc(props.data.thisMonth, props.data.lastMonth), left: { title: '本月', filterPeriod: 'this_month' }, right: { title: '上月', filterPeriod: 'last_month' } },
])
</script>

<template>
  <DashboardPanel title="同比环比分析">

    <div class="compare-grid">

      <div v-for="item in rows" :key="item.label" class="compare-card"
        @click="openCompare({ title: `详情 - ${item.label}`, left: item.left, right: item.right })">
        <div class="compare-title">
          {{ item.label }}
        </div>

        <div class="compare-value">
          {{ item.v1.toLocaleString() }}


          vs {{ item.v2.toLocaleString() }}

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

  padding: 24px 10px;

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

.compare-title {
  color: #94A3B8;

  font-size: 16px;

  line-height: 1;
}

.compare-value {
  color: #ffffff;

  font-size: 16px;
  font-weight: 600;

  line-height: 1.8;
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
