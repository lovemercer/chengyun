# 城东区AI智能监控系统运行驾驶舱

Vue 3 + TypeScript + Vite + ECharts 城市治理事件可视化大屏。

## 目录结构

```
dashboard/
  src/
    api/
      types.ts                       ← 11 个类型/接口定义
      event.ts                       ← 5 个真实 API 函数
      mockData.ts                    ← 全部 Mock 数据（API Mock + 详情 Mock）
      mockWeeklyReport.ts            ← 周报导出 Mock 数据
      request.ts                     ← fetch 封装 + AK/SK 签名
      statisticTest.ts               ← 统计接口参数测试（临时）

    composables/
      useEventData.ts                ← 事件类型字典（模块单例）
      useEventQuery.ts               ← 查询主入口（组装导出）
      queryHelpers.ts                ← 日期工具 + 常量 + 参数构造 + 记录映射
      statisticQueries.ts            ← 统计类查询（API 6）
      listQueries.ts                 ← 列表类查询（API 5）
      useCameraData.ts               ← 摄像头预加载 + 地名映射（模块单例）
      useDetailModal.ts              ← 详情弹窗状态管理（模块单例）
      useReducedMotion.ts            ← 无障碍动画降级
      useWeeklyReport.ts             ← 周报导出（Word）

    components/
      DashboardLayout.vue            ← 根布局（Header + KPI + 左中右三栏）
      HeaderBar.vue                  ← 顶部标题栏 + 时钟 + 导出按钮
      KPICard.vue                    ← KPI 卡片组件
      DashboardPanel.vue             ← 通用面板容器
      DetailModal.vue                ← 详情弹窗（records/compare 双模式）
      ExportReportButton.vue         ← 周报导出按钮

      left/                          ← 左栏面板
        EventCategoryChart.vue       ← 饼图：事件类型占比
        RankingList.vue              ← 柱状图：事件类型 TOP5
        GrowthAnalysis.vue           ← 卡片：同比环比分析

      right/                         ← 右栏面板
        AreaDistribution.vue         ← 折线图：事件区域分布（近7天）
        TrendComparison.vue          ← 柱状图：本周 vs 上周趋势对比
        LatestCaptures.vue           ← 表格：最新事件抓拍（2分钟轮询）

  docs/
    周报导出模块技术文档.md
  public/
    templates/AI赋能周报模板.docx    ← 周报 Word 模板
```

---

## 接口调用全景

页面首次加载共 **18 次** API 调用：

| 接口 | 次数 | 用途 |
|------|------|------|
| `getAllEventBasicInfo` (API 1) | 1 | 获取事件类型列表 |
| `fetchCameras` | 2 | 1732 个摄像头，1000/页分两次 |
| `statisticEvents` (API 6) | 12 | KPI(10) + 饼图/TOP5共享(1) + 区域(1) |
| `queryEvents` (API 5) | 3 | WeekComparison(1) + AreaTrend(1) + LatestCaptures(1) |

运行时增量：

| 触发条件 | 增加 |
|---------|------|
| 2 分钟轮询 | `queryEvents` +1 |
| 打开详情弹窗（records模式） | `queryEvents` +1 |
| 打开详情弹窗（compare模式） | `queryEvents` +2 |

---

## 各接口说明

### API 1 `getAllEventBasicInfo` — 事件类型列表
- 路径：`POST /api/v1/dataEvent/getAllEventBasicInfo`
- 调用者：`useEventData.init()`
- 返回：`[{ id, eventTableIndexCode, name }]`
- 用途：加载全部事件类型名称和编码，供给饼图、排名、详情弹窗做类型中文名映射

### API 4 `getIndexProperties` — ES 字段属性
- 路径：`GET /api/v1/dataEvent/getIndexProperties`
- 调用者：暂未调用（保留，后续用于查询 ES 索引字段列表）
- 用途：动态获取事件索引有哪些字段可用于过滤和展示

### API 5 `queryEvents` — 通用事件检索
- 路径：`POST /api/common/v1/query`
- 调用者：`listQueries.ts`（LatestCaptures + DetailRecords）、`statisticQueries.ts`（WeekComparison + AreaTrend）
- 返回：`{ total, list: [{ key, value }] }`
- 用途：分页查询事件明细列表，客户端可自行分桶聚合

### API 6 `statisticEvents` — 通用事件统计
- 路径：`POST /api/common/v1/statistic`
- 调用者：`statisticQueries.ts`（KPI + 饼图 + TOP5）
- 返回：`[{ count, value, colName }]`（数组，非 `{ total, list }` 对象）
- 用途：服务端聚合计数，用于 KPI 卡片和类型分布

### 摄像头 API `fetchCameras`
- 路径：`POST /api/resource/v1/cameras`
- 调用者：`useCameraData.preload()`
- 返回：`{ total, pageNo, pageSize, list: [{ cameraIndexCode, deviceIndexCode, name }] }`
- 用途：全量加载摄像头列表，构建 code→name 双索引 Map，O(1) 查找事件地点中文名

---

## 组件说明

### DashboardLayout（根布局）
- 路径：`src/components/DashboardLayout.vue`
- 职责：页面加载入口，初始化事件类型 + 摄像头预加载 + 拉 KPI 数据。KPI 加载完成后才渲染下方面板（`v-if="kpiReady"`）
- 数据流：KPI 数据传给 GrowthAnalysis 复用（省 6 次请求），子组件各自调自己的查询函数

### HeaderBar（顶栏）
- 路径：`src/components/HeaderBar.vue`
- 显示：标题"城东区AI智能监控系统运行驾驶舱" + 实时时钟（每秒刷新） + 周报导出按钮

### KPICard（KPI 卡片）
- 路径：`src/components/KPICard.vue`
- 显示：标签 + 数值 + 环比变化箭头
- 6 张卡片：事件总数(累计) / 今日新增事件 / 昨日新增事件 / 近一周事件数 / 近一月事件数 / 近一年事件数

### EventCategoryChart（事件类型占比）
- 路径：`src/components/left/EventCategoryChart.vue`
- 接口：`statisticEvents`（groupBy 事件类型）— 1 次
- 交互：点击饼图或图例打开详情弹窗（filterType）

### RankingList（事件类型 TOP5）
- 路径：`src/components/left/RankingList.vue`
- 接口：`statisticEvents`（groupBy 事件类型）— 1 次
- 交互：点击柱状图打开详情弹窗（filterType）

### GrowthAnalysis（同比环比分析）
- 路径：`src/components/left/GrowthAnalysis.vue`
- 数据：从父组件 DashboardLayout 接收 props（复用 KPI 请求的原始数据）
- 接口：无（0 次，数据由 KPI 透传）
- 交互：点击卡片打开 compare 弹窗（filterPeriod：today/yesterday/this_week/last_week/this_month/last_month）

### AreaDistribution（事件区域分布）
- 路径：`src/components/right/AreaDistribution.vue`
- 接口：`queryEvents`（7天范围，客户端按类型+按天双维度分桶）— 1 次
- 交互：点击折线图打开详情弹窗（filterDate）

### TrendComparison（事件趋势对比）
- 路径：`src/components/right/TrendComparison.vue`
- 接口：`queryEvents`（两周范围，客户端按天分桶）— 1 次
- 交互：点击柱状图打开 compare 弹窗（filterPeriod + filterWeekday）

### LatestCaptures（最新事件抓拍）
- 路径：`src/components/right/LatestCaptures.vue`
- 接口：`queryEvents`（最新6条，每2分钟轮询）— 首次1次 + 2分钟/次
- 特性：摄像头数据加载完成后自动刷新地点名称；新事件到达时平滑滚动到顶部

### DetailModal（详情弹窗）
- 路径：`src/components/DetailModal.vue`
- 接口：`queryEvents`（分页 + 过滤）— 打开时1次（records）或2次（compare）
- 模式：records（单列表）/ compare（左右对比）
- 过滤：filterType（事件类型）/ filterPeriod（时间段）/ filterWeekday（周几）/ filterDate（日期）

### ExportReportButton（周报导出）
- 路径：`src/components/ExportReportButton.vue`
- 依赖：`useWeeklyReport.ts` → `mockWeeklyReport.ts` + `pizzip` + `file-saver`
- 功能：点击生成 Word 周报并下载

---

## 数据流

```
DashboardLayout.onMounted
  ├─ await init()                      → API 1 (1次)
  ├─ preloadCameras()                  → 摄像头 API (2次，后台)
  ├─ await fetchKpiStats()             → API 6 (10次)
  │     └─ growth 数据透传 → GrowthAnalysis (0次)
  ├─ kpiReady = true
  └─ 子组件渲染：
        EventCategoryChart              → API 6 (1次)
        RankingList                     → API 6 (1次)
        AreaDistribution                → API 5 (1次)
        TrendComparison                 → API 5 (1次)
        LatestCaptures                  → API 5 (1次)
                                         └─ 2分钟后自动刷新
```

## 请求合并优化记录

| 优化项 | 之前 | 之后 | 省 |
|--------|------|------|-----|
| WeekComparison 14次逐天统计 → 1次 queryEvents | 14 | 1 | 13 |
| GrowthAnalysis 复用 KPI 数据 | 6 | 0 | 6 |
| AreaTrend 假数据 → 1次 queryEvents | 1 | 1 | —（替换） |
| 饼图+TOP5 共享一次 statisticEvents | 2 | 1 | 1 |
| **总计（首次加载）** | **34** | **18** | **16** |

## 常用命令

```bash
npm run dev          # 开发（含 proxy，自动签名）
npm run build        # 生产构建
npx vue-tsc --noEmit # 类型检查
```
