<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useDetailModal } from '@/composables/useDetailModal'
import { useEventQuery } from '@/composables/useEventQuery'

const {
  visible, mode, title,
  filterType, filterPeriod, filterDate,
  leftSide, rightSide,
  closeDetail
} = useDetailModal()

const { fetchDetailRecords } = useEventQuery()

interface EventRecord {
  id: string
  time: string
  dateStr: string
  type: string
  location: string
  detail: string
}

const pageSize = 10
const leftPage = ref(1)
const rightPage = ref(1)

// Records mode
const recordTotal = ref(0)
const pagedRecords = ref<EventRecord[]>([])

// Compare mode
const leftTotal = ref(0)
const leftPaged = ref<EventRecord[]>([])
const rightTotal = ref(0)
const rightPaged = ref<EventRecord[]>([])

async function loadRecords() {
  const filter: {
    filterType?: string
    filterPeriod?: string
    filterDate?: string
  } = {}
  if (filterType.value) filter.filterType = filterType.value
  if (filterPeriod.value) filter.filterPeriod = filterPeriod.value
  if (filterDate.value) filter.filterDate = filterDate.value

  const res = await fetchDetailRecords({
    ...filter,
    pageNo: leftPage.value,
    pageSize,
  })
  recordTotal.value = res.total
  pagedRecords.value = res.list as EventRecord[]
}

async function loadLeft() {
  const res = await fetchDetailRecords({
    filterType: leftSide.value.filterType,
    filterPeriod: leftSide.value.filterPeriod,
    filterWeekday: leftSide.value.filterWeekday,
    pageNo: leftPage.value,
    pageSize,
  })
  leftTotal.value = res.total
  leftPaged.value = res.list as EventRecord[]
}

async function loadRight() {
  const res = await fetchDetailRecords({
    filterType: rightSide.value.filterType,
    filterPeriod: rightSide.value.filterPeriod,
    filterWeekday: rightSide.value.filterWeekday,
    pageNo: rightPage.value,
    pageSize,
  })
  rightTotal.value = res.total
  rightPaged.value = res.list as EventRecord[]
}

async function loadAll() {
  if (mode.value === 'records') {
    await loadRecords()
  } else if (mode.value === 'compare') {
    await Promise.all([loadLeft(), loadRight()])
  }
}

// 监听 visible 变化（打开弹窗时加载）
watch(visible, async (v) => {
  if (v) {
    leftPage.value = 1
    rightPage.value = 1
    await loadAll()
  }
})

// 监听分页变化
watch(leftPage, () => {
  if (mode.value === 'records') loadRecords()
  else loadLeft()
})
watch(rightPage, () => {
  if (mode.value === 'compare') loadRight()
})

const recordTotalPages = ref(0)
const leftTotalPages = ref(0)
const rightTotalPages = ref(0)

watch(recordTotal, (t) => { recordTotalPages.value = Math.max(1, Math.ceil(t / pageSize)) })
watch(leftTotal, (t) => { leftTotalPages.value = Math.max(1, Math.ceil(t / pageSize)) })
watch(rightTotal, (t) => { rightTotalPages.value = Math.max(1, Math.ceil(t / pageSize)) })

function getPageNumbers(current: number, total: number) {
  const pages: (number | '...')[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
}

function goToPage(page: number, side: 'left' | 'right' = 'left') {
  if (side === 'left') {
    leftPage.value = page
  } else {
    rightPage.value = page
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value) closeDetail()
}

function handleMaskClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-mask')) closeDetail()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-mask" @click="handleMaskClick">
        <div class="modal-container" :class="{ 'mode-compare': mode === 'compare' }">

          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button class="modal-close" @click="closeDetail" aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Records Mode -->
          <div v-if="mode === 'records'" class="modal-body">
            <div class="modal-info">
              共 <strong>{{ recordTotal }}</strong> 条记录
            </div>

            <table class="detail-table">
              <thead>
                <tr>
                  <th class="col-index">序号</th>
                  <th class="col-time">时间</th>
                  <th class="col-type">事件类型</th>
                  <th class="col-location">地点</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in pagedRecords" :key="item.id">
                  <td class="col-index">{{ (leftPage - 1) * pageSize + index + 1 }}</td>
                  <td class="col-time">{{ item.time }}</td>
                  <td class="col-type">{{ item.type }}</td>
                  <td class="col-location">{{ item.location }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="mode === 'records'" class="modal-footer">
            <div class="pagination">
              <button class="page-btn" :disabled="leftPage === 1" @click="goToPage(leftPage - 1)">上一页</button>
              <button
                v-for="(p, i) in getPageNumbers(leftPage, recordTotalPages)" :key="i"
                class="page-btn" :class="{ active: p === leftPage, dots: p === '...' }"
                :disabled="p === '...'"
                @click="typeof p === 'number' && goToPage(p)"
              >{{ p }}</button>
              <button class="page-btn" :disabled="leftPage === recordTotalPages" @click="goToPage(leftPage + 1)">下一页</button>
            </div>
          </div>

          <!-- Compare Mode -->
          <template v-if="mode === 'compare'">
            <div class="modal-body compare-body">
              <div class="compare-side">
                <div class="side-header">
                  <span class="side-title">{{ leftSide.title }}</span>
                  <span class="side-count">{{ leftTotal }} 条</span>
                </div>

                <table class="detail-table">
                  <thead>
                    <tr>
                      <th class="col-index">序号</th>
                      <th class="col-time">时间</th>
                      <th class="col-type">类型</th>
                      <th class="col-location">地点</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in leftPaged" :key="item.id">
                      <td class="col-index">{{ (leftPage - 1) * pageSize + index + 1 }}</td>
                      <td class="col-time">{{ item.time }}</td>
                      <td class="col-type">{{ item.type }}</td>
                      <td class="col-location">{{ item.location }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="compare-divider"></div>

              <div class="compare-side">
                <div class="side-header">
                  <span class="side-title">{{ rightSide.title }}</span>
                  <span class="side-count">{{ rightTotal }} 条</span>
                </div>

                <table class="detail-table">
                  <thead>
                    <tr>
                      <th class="col-index">序号</th>
                      <th class="col-time">时间</th>
                      <th class="col-type">类型</th>
                      <th class="col-location">地点</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in rightPaged" :key="item.id">
                      <td class="col-index">{{ (rightPage - 1) * pageSize + index + 1 }}</td>
                      <td class="col-time">{{ item.time }}</td>
                      <td class="col-type">{{ item.type }}</td>
                      <td class="col-location">{{ item.location }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="modal-footer compare-footer">
              <div class="pagination">
                <button class="page-btn" :disabled="leftPage === 1" @click="goToPage(leftPage - 1, 'left')">上一页</button>
                <button
                  v-for="(p, i) in getPageNumbers(leftPage, leftTotalPages)" :key="i"
                  class="page-btn" :class="{ active: p === leftPage, dots: p === '...' }"
                  :disabled="p === '...'"
                  @click="typeof p === 'number' && goToPage(p, 'left')"
                >{{ p }}</button>
                <button class="page-btn" :disabled="leftPage === leftTotalPages" @click="goToPage(leftPage + 1, 'left')">下一页</button>
              </div>

              <div class="pagination">
                <button class="page-btn" :disabled="rightPage === 1" @click="goToPage(rightPage - 1, 'right')">上一页</button>
                <button
                  v-for="(p, i) in getPageNumbers(rightPage, rightTotalPages)" :key="i"
                  class="page-btn" :class="{ active: p === rightPage, dots: p === '...' }"
                  :disabled="p === '...'"
                  @click="typeof p === 'number' && goToPage(p, 'right')"
                >{{ p }}</button>
                <button class="page-btn" :disabled="rightPage === rightTotalPages" @click="goToPage(rightPage + 1, 'right')">下一页</button>
              </div>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, .65);
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 80vw;
  max-width: 1100px;
  max-height: 80vh;

  display: flex;
  flex-direction: column;

  background:
    linear-gradient(180deg,
      rgba(15, 23, 42, .96),
      rgba(10, 18, 35, .98));

  border: 1px solid rgba(0, 229, 255, .35);
  border-radius: 8px;

  box-shadow:
    0 0 30px rgba(0, 229, 255, .12),
    inset 0 0 20px rgba(0, 229, 255, .04);

  overflow: hidden;
}

.modal-container.mode-compare {
  max-width: 90vw;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 18px 24px;

  border-bottom: 1px solid rgba(0, 229, 255, .2);
}

.modal-title {
  margin: 0;

  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #F8FAFC;

  letter-spacing: 2px;

  text-shadow: 0 0 8px rgba(0, 229, 255, .5);
}

.modal-close {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: none;
  border: 1px solid rgba(0, 229, 255, .3);
  border-radius: 4px;

  color: #94A3B8;
  cursor: pointer;

  transition: all .2s;
}

.modal-close:hover {
  color: #F8FAFC;
  border-color: #00e5ff;
  background: rgba(0, 229, 255, .1);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

/* Body */
.modal-body {
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
}

.modal-info {
  color: #94A3B8;
  font-size: 13px;
  margin-bottom: 12px;
}

.modal-info strong {
  color: #00e5ff;
}

/* Compare Layout */
.compare-body {
  display: flex;
  gap: 0;
  padding: 16px 0;
  overflow: hidden;
}

.compare-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 20px;
}

.compare-divider {
  width: 1px;
  background: rgba(0, 229, 255, .2);
  flex-shrink: 0;
}

.side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.side-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #F8FAFC;
  letter-spacing: 1px;
}

.side-count {
  font-size: 12px;
  color: #00e5ff;
}

.compare-side .detail-table {
  flex: 1;
}

/* Table */
.detail-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.detail-table th {
  height: 36px;

  color: #94A3B8;
  font-size: 12px;
  font-weight: 600;

  text-align: left;
  padding: 0 10px;

  background: rgba(0, 229, 255, .06);
  border-bottom: 1px solid rgba(0, 229, 255, .2);
  position: sticky;
  top: 0;
  z-index: 1;
}

.detail-table td {
  height: 36px;

  padding: 0 10px;

  color: #F8FAFC;
  font-size: 12px;

  border-bottom: 1px solid rgba(0, 229, 255, .06);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-table tbody tr {
  transition: background .2s;
}

.detail-table tbody tr:hover {
  background: rgba(0, 229, 255, .06);
}

.col-index { width: 50px; color: #94A3B8; text-align: center; }
.col-time { width: 130px; font-family: 'Exo 2', monospace; color: #00e5ff; }
.col-type { width: 90px; }
.col-location { width: 130px; }
.col-detail { }

/* Footer / Pagination */
.modal-footer {
  padding: 14px 24px;

  border-top: 1px solid rgba(0, 229, 255, .2);
}

.compare-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 4px;
}

.page-btn {
  height: 28px;
  padding: 0 8px;

  background: rgba(0, 229, 255, .06);
  border: 1px solid rgba(0, 229, 255, .2);
  border-radius: 4px;

  color: #94A3B8;
  font-size: 12px;
  cursor: pointer;

  transition: all .2s;
}

.page-btn:hover:not(:disabled):not(.dots) {
  color: #F8FAFC;
  border-color: #00e5ff;
  background: rgba(0, 229, 255, .12);
}

.page-btn.active {
  color: #0F172A;
  background: #00e5ff;
  border-color: #00e5ff;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.page-btn.dots {
  border: none;
  background: none;
  cursor: default;
}

/* Transition */
.modal-enter-active {
  transition: opacity .25s ease;
}
.modal-leave-active {
  transition: opacity .2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container {
  transition: transform .25s ease;
}
.modal-enter-from .modal-container {
  transform: scale(.95) translateY(10px);
}
</style>
