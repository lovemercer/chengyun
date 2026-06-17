<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ExportReportButton from './ExportReportButton.vue'

const currentTime = ref('')

const updateTime = () => {
  const now = new Date()

  const date =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const time =
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  currentTime.value = `${date} ${time}`
}

let timer: number

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <header class="header-wrap">
    <div class="header-bg">

      <h1 class="title">
       城东区AI智能监控系统运行驾驶舱
      </h1>

      <div class="sub-title">
        East District AI Intelligent Monitoring Operations Center
      </div>

      <div class="header-right">
        <ExportReportButton />
        <div class="update-time">
          {{ currentTime }}
        </div>
      </div>

    </div>
  </header>
</template>

<style scoped>
.header-wrap {
  width: 100%;
  height: 100px;
  margin-bottom: 2vh;
}

.header-bg {
  position: relative;

  width: 1180px;
  height: 130px;

  margin: 0 auto;

  background: url('/images/1.png') center center no-repeat;
  background-size: 100% 100%;
}

.title {
  position: absolute;

  left: 50%;
  top: 25%;

  transform: translateX(-50%);

  margin: 0;

  color: #F8FAFC;

  font-family: 'Orbitron', sans-serif;
  font-size: 34px;
  font-weight: 700;

  letter-spacing: 4px;

  text-shadow:
    0 0 10px #00e5ff,
    0 0 25px #00e5ff;
}

.sub-title {
  position: absolute;

  left: 50%;
  top: 60%;

  transform: translateX(-50%);

  color: #94A3B8;

  font-size: 12px;

  letter-spacing: 2px;
}

.header-right {
  position: absolute;

  right: -40%;
  top: 15%;

  display: flex;
  align-items: center;
  gap: 16px;
}

.update-time {
  text-align: right;

  color: #79e7ff;

  font-size: 26px;

  line-height: 1.5;
}
</style>