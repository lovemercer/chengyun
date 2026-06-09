<script setup lang="ts">
defineProps<{
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  changeLabel?: string
}>()
</script>

<template>
  <div class="kpi-card">

    <div class="icon-wrapper">

      <div class="icon-glow"></div>

      <div class="icon-box">
        <slot name="icon" />
      </div>

    </div>

    <div class="content">

      <div class="label">
        {{ label }}
      </div>

      <div class="value">
        {{ value }}
      </div>

      <div
        v-if="change"
        class="change-row"
      >
        <span class="change-label">
          {{ changeLabel }}
        </span>

        <span
          class="change-value"
          :class="changeType"
        >
          <span class="arrow">
            {{ changeType === 'up' ? '↑' : '↓' }}
          </span>

          {{ change }}
        </span>
      </div>

    </div>

  </div>
</template>

<style scoped>
.kpi-card {
  position: relative;

  width: 100%;
  height: 150px;

  display: flex;
  align-items: center;

  padding: 0 40px;

  box-sizing: border-box;

  background:
    url('/images/9.png')
    center center /
    100% 100%
    no-repeat;

  overflow: hidden;
}

/* 只压暗中心区域 */
.kpi-card::before {
  content: '';

  position: absolute;

  top: 12px;
  bottom: 12px;
  left: 15px;
  right: 15px;

  background: rgba(0, 8, 25, 0.18);

  border-radius: 6px;

  z-index: 1;

  pointer-events: none;
}

/* ==========================
   ICON
========================== */

.icon-wrapper {
  width: 116px;
  height: 116px;

  flex-shrink: 0;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 30px;

  z-index: 2;
}

.icon-box {
  width: 108px;
  height: 108px;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 2;
}

.icon-box :deep(svg) {
  width: 100%;
  height: 100%;
}

.icon-glow {
  position: absolute;

  bottom: 8px;

  width: 64px;
  height: 64px;

  border-radius: 999px;

  background:
    radial-gradient(
      circle,
      rgba(0,229,255,.9),
      rgba(0,229,255,.15),
      transparent
    );

  filter: blur(6px);

  z-index: 1;
}

/* ==========================
   CONTENT
========================== */

.content {
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;

  min-width: 0;

  position: relative;

  z-index: 2;
}

.label {
  color: #dff8ff;

  font-size: 16px;
  font-weight: 500;

  margin-bottom: 10px;

  white-space: nowrap;

  letter-spacing: .5px;
}

.value {
  color: #ffffff;

  font-size: 30px;
  font-weight: 800;

  line-height: 1;

  font-family:
    DIN,
    "DIN Alternate",
    "Bahnschrift",
    sans-serif;

  text-shadow:
    0 0 10px rgba(0,229,255,.5);
}

.change-row {
  margin-top: 8px;

  display: flex;
  align-items: center;

  gap: 6px;
}

.change-label {
  color: #8dbfd6;

  font-size: 16px;
}

.change-value {
  display: flex;
  align-items: center;

  font-size: 16px;
  font-weight: 700;
}

.arrow {
  margin-right: 2px;
}

.change-value.up {
  color: #ff5959;

  text-shadow:
    0 0 8px rgba(255,89,89,.4);
}

.change-value.down {
  color: #32d96b;

  text-shadow:
    0 0 8px rgba(50,217,107,.4);
}
</style>