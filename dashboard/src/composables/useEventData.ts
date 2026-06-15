import { ref, shallowRef } from 'vue'
import { getAllEventBasicInfo, type EventBasicInfo } from '@/api/event'

// ============================================================
// 事件类型数据管理（模块级单例）
// ============================================================

const eventTypes = shallowRef<EventBasicInfo[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const initialized = ref(false)

/** 名称 → 编码 快速查找 */
const nameToCode = new Map<string, string>()
/** 编码 → 名称 快速查找 */
const codeToName = new Map<string, string>()

export function useEventData() {
  async function init() {
    if (initialized.value) return
    loading.value = true
    error.value = null

    try {
      const res = await getAllEventBasicInfo()
      eventTypes.value = res.data

      nameToCode.clear()
      codeToName.clear()
      for (const item of res.data) {
        nameToCode.set(item.name, item.eventTableIndexCode)
        codeToName.set(item.eventTableIndexCode, item.name)
      }

      initialized.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取事件类型失败'
    } finally {
      loading.value = false
    }
  }

  function getCodeByName(name: string): string | undefined {
    return nameToCode.get(name)
  }

  function getNameByCode(code: string): string | undefined {
    return codeToName.get(code)
  }

  function getNames(): string[] {
    return eventTypes.value.map((t) => t.name)
  }

  return {
    eventTypes,
    loading,
    error,
    initialized,
    init,
    getCodeByName,
    getNameByCode,
    getNames,
  }
}
