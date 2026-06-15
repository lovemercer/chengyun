<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DashboardPanel from '../DashboardPanel.vue'
import { useEventQuery } from '@/composables/useEventQuery'

interface Capture {
  id: number
  time: string
  type: string
  location: string
}

const { fetchLatestCaptures } = useEventQuery()

const captures = ref<Capture[]>([])

let timer: ReturnType<typeof setInterval>

async function refresh() {
  captures.value = await fetchLatestCaptures(6)
}

onMounted(async () => {
  await refresh()
  timer = setInterval(refresh, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <DashboardPanel title="最新事件抓拍">

    <div class="table-wrapper">

      <div v-if="captures.length === 0" class="empty-state">
        暂无事件数据
      </div>

      <table v-else class="capture-table">

        <thead>
          <tr>
            <th>时间</th>
            <th>事件类型</th>
            <th>地点</th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="item in captures" :key="item.id" tabindex="0" role="row">
            <td>{{ item.time }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.location }}</td>
          </tr>

        </tbody>

      </table>

    </div>

  </DashboardPanel>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  height: 100%;

  overflow: hidden;
}

.capture-table {
  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;
}

.capture-table thead {
  background:
    linear-gradient(90deg,
      rgba(0, 229, 255, .12),
      rgba(0, 229, 255, .04));
}

.capture-table th {
  height: 38px;

  color: #94A3B8;

  font-size: 13px;
  font-weight: 600;

  text-align: left;

  padding: 0 12px;

  border-bottom: 1px solid rgba(0, 229, 255, .25);
}

.capture-table td {
  height: 40px;

  padding: 0 12px;

  color: #F8FAFC;

  font-size: 13px;

  border-bottom: 1px solid rgba(0, 229, 255, .08);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.capture-table tbody tr {
  transition: all .25s ease;
  outline: none;
}

.capture-table tbody tr:focus-visible {
  background: rgba(0, 229, 255, .12);
  box-shadow: inset 0 0 0 2px #00e5ff;
}

.capture-table tbody tr:hover {
  background:
    rgba(0, 229, 255, .08);
}

.capture-table tbody tr:hover td {
  color: #F8FAFC;
}

.capture-table td:first-child {
  color: #00e5ff;
  font-family: 'Exo 2', sans-serif;
}

.capture-table td:nth-child(2) {
  color: #00e5ff;
}

/* 空状态 */
.empty-state {
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #94A3B8;

  font-size: 14px;
}
</style>
