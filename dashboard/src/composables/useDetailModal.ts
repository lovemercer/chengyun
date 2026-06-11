import { ref } from 'vue'

export type DetailMode = 'records' | 'compare'

export interface CompareSide {
  title: string
  filterPeriod?: string
  filterType?: string
  filterWeekday?: number
}

const visible = ref(false)
const mode = ref<DetailMode>('records')
const title = ref('')
const filterType = ref('')
const filterPeriod = ref('')
const filterDate = ref('')
const leftSide = ref<CompareSide>({ title: '' })
const rightSide = ref<CompareSide>({ title: '' })

export function useDetailModal() {
  function openRecords(opts: {
    title: string
    filterType?: string
    filterPeriod?: string
    filterDate?: string
  }) {
    mode.value = 'records'
    title.value = opts.title
    filterType.value = opts.filterType ?? ''
    filterPeriod.value = opts.filterPeriod ?? ''
    filterDate.value = opts.filterDate ?? ''
    visible.value = true
  }

  function openCompare(opts: {
    title: string
    left: CompareSide
    right: CompareSide
  }) {
    mode.value = 'compare'
    title.value = opts.title
    leftSide.value = opts.left
    rightSide.value = opts.right
    visible.value = true
  }

  function closeDetail() {
    visible.value = false
  }

  return {
    visible,
    mode,
    title,
    filterType,
    filterPeriod,
    filterDate,
    leftSide,
    rightSide,
    openRecords,
    openCompare,
    closeDetail
  }
}
