<script setup lang="ts">
import { useWeeklyReport } from '../composables/useWeeklyReport'

const { exporting, exportReport } = useWeeklyReport()
</script>

<template>
  <button
    class="export-btn"
    :disabled="exporting"
    @click="exportReport()"
  >
    <svg
      v-if="!exporting"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    <span>{{ exporting ? '导出中...' : '导出周报' }}</span>
  </button>
</template>

<style scoped>
.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 6px 16px;
  border: 1px solid var(--color-dashboard-blue, #00e5ff);
  border-radius: 4px;
  background: rgba(0, 229, 255, 0.08);
  color: var(--color-dashboard-blue, #00e5ff);
  font-size: 13px;
  font-family: var(--font-body, 'Exo 2', sans-serif);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.export-btn:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.18);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
