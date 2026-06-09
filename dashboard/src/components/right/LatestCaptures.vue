<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DashboardPanel from '../DashboardPanel.vue'

interface Capture {
  id: number
  time: string
  type: string
  location: string
}

const captures = ref<Capture[]>([
  {
    id: 1,
    time: '22:23:31',
    type: '占道经营',
    location: '水木大桥路口'
  },
  {
    id: 2,
    time: '22:23:25',
    type: '人员聚集',
    location: '喜悦广场'
  },
  {
    id: 3,
    time: '22:23:18',
    type: '乱堆暴露',
    location: '名城·星耀北门'
  },
  {
    id: 4,
    time: '22:23:05',
    type: '乱贴广告',
    location: '真如大明城'
  },
  {
    id: 5,
    time: '22:22:58',
    type: '垃圾暴露',
    location: '东关大街'
  }
])

const types = [
  '占道经营',
  '人员聚集',
  '乱堆暴露',
  '乱贴广告',
  '垃圾暴露',
  '车辆违停'
]

const locations = [
  '水木大桥路口',
  '喜悦广场',
  '名城·星耀北门',
  '真如大明城',
  '东关大街',
  '昆仑路',
  '建国路'
]

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    const now = new Date()

    const time =
      `${String(now.getHours()).padStart(2, '0')}:` +
      `${String(now.getMinutes()).padStart(2, '0')}:` +
      `${String(now.getSeconds()).padStart(2, '0')}`

    captures.value.unshift({
      id: Date.now(),
      time,
      type: types[Math.floor(Math.random() * types.length)],
      location: locations[Math.floor(Math.random() * locations.length)]
    })

    if (captures.value.length > 6) {
      captures.value.pop()
    }
  }, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <DashboardPanel title="最新事件抓拍">

    <div class="table-wrapper">

      <table class="capture-table">

        <thead>
          <tr>
            <th>时间</th>
            <th>事件类型</th>
            <th>地点</th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="item in captures" :key="item.id">
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

  color: #7fe8ff;

  font-size: 13px;
  font-weight: 600;

  text-align: left;

  padding: 0 12px;

  border-bottom: 1px solid rgba(0, 229, 255, .25);
}

.capture-table td {
  height: 40px;

  padding: 0 12px;

  color: #eafcff;

  font-size: 13px;

  border-bottom: 1px solid rgba(0, 229, 255, .08);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.capture-table tbody tr {
  transition: all .25s ease;
}

.capture-table tbody tr:hover {
  background:
    rgba(0, 229, 255, .08);
}

.capture-table tbody tr:hover td {
  color: #ffffff;
}

.capture-table td:first-child {
  color: #7fe8ff;
  font-family: DIN;
}

.capture-table td:nth-child(2) {
  color: #00e5ff;
}
</style>