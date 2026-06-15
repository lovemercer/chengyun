<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardPanel from '../DashboardPanel.vue'
import { useDetailModal } from '@/composables/useDetailModal'
import { useEventQuery } from '@/composables/useEventQuery'

const { openCompare } = useDetailModal()
const { fetchGrowthAnalysis } = useEventQuery()

interface GrowthRow {
  label: string
  v1: number
  v2: number
  pct: number
  dir: 'up' | 'down'
  left: { title: string }
  right: { title: string }
}

const rows = ref<GrowthRow[]>([])

onMounted(async () => {
  const data = await fetchGrowthAnalysis()
  rows.value = [
    {
      label: '今日 vs 昨日',
      v1: data[0].v1, v2: data[0].v2,
      pct: data[0].pct, dir: data[0].dir,
      left: { title: '今日' }, right: { title: '昨日' },
    },
    {
      label: '本周 vs 上周',
      v1: data[1].v1, v2: data[1].v2,
      pct: data[1].pct, dir: data[1].dir,
      left: { title: '本周' }, right: { title: '上周' },
    },
    {
      label: '本月 vs 上月',
      v1: data[2].v1, v2: data[2].v2,
      pct: data[2].pct, dir: data[2].dir,
      left: { title: '本月' }, right: { title: '上月' },
    },
  ]
})
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
