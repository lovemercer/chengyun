<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import DashboardPanel from '../DashboardPanel.vue'
import { useEventQuery } from '@/composables/useEventQuery'
import { useCameraData } from '@/composables/useCameraData'

interface Capture {
  id: string
  time: string
  type: string
  location: string
}

const { fetchLatestCaptures } = useEventQuery()
const { ready: cameraReady } = useCameraData()

const captures = ref<Capture[]>([])
const scrollBox = ref<HTMLDivElement>()

let timer: ReturnType<typeof setInterval>
let oldIds = new Set<string>()

async function refresh() {
  const list = await fetchLatestCaptures(6)
  // 检测新事件：对比旧 id 集合
  const newIds = new Set(list.map(c => c.id))
  const hasNew = list.some(c => !oldIds.has(c.id))
  oldIds = newIds

  captures.value = list
  // 有新事件时滚动到顶部展示
  if (hasNew) {
    await nextTick()
    if (scrollBox.value) {
      scrollBox.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

onMounted(async () => {
  await refresh()
  timer = setInterval(refresh, 120000)
})

onUnmounted(() => {
  clearInterval(timer)
})

watch(cameraReady, (isReady) => {
  if (isReady) refresh()
})
</script>

<template>
  <DashboardPanel title="最新事件抓拍">

    <div ref="scrollBox" class="table-wrapper">

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

        <TransitionGroup tag="tbody" name="row" @enter="() => {}">
          <tr v-for="item in captures" :key="item.id" tabindex="0" role="row">
            <td>{{ item.time }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.location }}</td>
          </tr>
        </TransitionGroup>

      </table>

    </div>

  </DashboardPanel>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 滚动条美化 */
.table-wrapper::-webkit-scrollbar {
  width: 4px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, .25);
  border-radius: 2px;
}

.capture-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.capture-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
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
  transition: background .25s ease;
  outline: none;
}

.capture-table tbody tr:focus-visible {
  background: rgba(0, 229, 255, .12);
  box-shadow: inset 0 0 0 2px #00e5ff;
}

.capture-table tbody tr:hover {
  background: rgba(0, 229, 255, .08);
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

/* 行过渡动画 */
.row-enter-active {
  transition: all .4s ease;
}
.row-enter-from {
  opacity: 0;
  transform: translateY(-10px);
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
