/**
 * 摄像头数据管理（模块级单例）
 *
 * 加载策略（按优先级）：
 *   1. 内存 Map —— O(1) 查找，主数据源
 *   2. sessionStorage —— 页面刷新时复用，避免重复请求
 *   3. API 分页拉取 —— 首次访问或缓存过期时触发
 *
 * API 限制：pageSize ≤ 1000，摄像头总量 ≤ 3000 → 最多 3 次请求
 */

import { ref } from 'vue'
import { fetchCameras } from '@/api/event'

// ---- 常量 ----

const PAGE_SIZE = 1000
const CACHE_KEY = 'camera_list_cache'

/** 缓存条目（压缩字段名，节省空间） */
interface CacheEntry {
  c: string // cameraIndexCode
  d: string // deviceIndexCode
  n: string // name
}

// ---- 模块级状态 ----

/** cameraIndexCode → 摄像头名称 */
const cameraByCameraCode = new Map<string, string>()

/** deviceIndexCode → 摄像头名称 */
const cameraByDeviceCode = new Map<string, string>()

const ready = ref(false)
const loaded = ref(0)
const totalCount = ref(0)

let loading = false

// ---- 内部函数 ----

/** 将一条摄像头记录装入双索引 Map */
function indexCamera(cam: { cameraIndexCode: string; deviceIndexCode: string; name: string }) {
  if (!cam.name) return
  cameraByCameraCode.set(cam.cameraIndexCode, cam.name)
  cameraByDeviceCode.set(cam.deviceIndexCode, cam.name)
}

/** 从 sessionStorage 读取缓存并装入 Map */
function loadFromCache(): boolean {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return false

    const entries: CacheEntry[] = JSON.parse(raw)
    if (!Array.isArray(entries) || entries.length === 0) return false

    for (const e of entries) {
      indexCamera({ cameraIndexCode: e.c, deviceIndexCode: e.d, name: e.n })
    }

    totalCount.value = entries.length
    loaded.value = entries.length
    ready.value = true
    return true
  } catch {
    sessionStorage.removeItem(CACHE_KEY)
    return false
  }
}

/** 从 API 分页拉取全部摄像头，同时收集缓存数据 */
async function fetchAllFromApi() {
  const cacheEntries: CacheEntry[] = []

  // 第一页
  const firstRes = await fetchCameras(1, PAGE_SIZE)
  const { list: firstList, total } = firstRes.data

  totalCount.value = total

  for (const cam of firstList) {
    indexCamera(cam)
    cacheEntries.push({ c: cam.cameraIndexCode, d: cam.deviceIndexCode, n: cam.name })
  }
  loaded.value = firstList.length

  // 根据 total 计算剩余页数
  while (loaded.value < total) {
    const pageNo = Math.floor(loaded.value / PAGE_SIZE) + 1
    const res = await fetchCameras(pageNo, PAGE_SIZE)
    for (const cam of res.data.list) {
      indexCamera(cam)
      cacheEntries.push({ c: cam.cameraIndexCode, d: cam.deviceIndexCode, n: cam.name })
    }
    loaded.value = Math.min(pageNo * PAGE_SIZE, total)
  }

  // 写入 sessionStorage
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntries))
  } catch {
    // sessionStorage 不可用，静默失败
  }
}

// ---- 公开 API ----

export function useCameraData() {
  /**
   * 预加载全部摄像头（应用初始化时调用一次，幂等）
   *
   * 执行顺序：
   *   ① 先查 sessionStorage 缓存 → 命中则直接装入 Map，秒开
   *   ② 缓存未命中 → API 分页拉取 → 装入 Map → 写入 sessionStorage
   */
  async function preload() {
    if (loading || ready.value) return
    loading = true

    try {
      // ① 优先从 sessionStorage 恢复
      if (loadFromCache()) {
        loading = false
        return
      }

      // ② 缓存未命中，走 API（内部自动写入 sessionStorage）
      await fetchAllFromApi()

      ready.value = true
    } catch (e) {
      console.error('摄像头数据预加载失败:', e)
      ready.value = true
    } finally {
      loading = false
    }
  }

  /**
   * 根据摄像头/设备编码获取位置名称
   * cameraIndexCode → deviceIndexCode → 原始编码兜底
   */
  function getLocation(code: string | undefined | null): string {
    if (!code) return '--'
    return cameraByCameraCode.get(code)
      ?? cameraByDeviceCode.get(code)
      ?? code
  }

  return {
    ready,
    loaded,
    totalCount,
    preload,
    getLocation,
  }
}
