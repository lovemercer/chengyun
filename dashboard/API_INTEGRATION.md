# 海康 Artemis 接口对接说明

## 架构概览

```
浏览器 → Vite Proxy(/api) → 海康 Artemis 网关 → 海康后端服务
              ↑ 自动附加 appKey/appSecret
```

```
src/
  api/
    request.ts          ← fetch 封装，统一鉴权 + 错误处理
    event.ts            ← 7 个海康接口函数（mock 激活，真实注释）
  composables/
    useEventData.ts     ← 事件类型列表管理（单例）
    useEventQuery.ts    ← 看板数据查询方法（mock 激活，真实注释）
  data/
    mockDetail.ts       ← 旧 mock 数据（被 useEventQuery mock 路径引用）
```

---

## 7 个海康接口

| # | 函数 | 用途 | 方法 |
|---|------|------|------|
| 1 | `getAllEventBasicInfo` | 获取所有事件类型列表 | POST |
| 2 | `getEventDetailInfoByIds` | 获取事件类型详情（ES/Kafka 连接） | POST |
| 3 | `getEventMqField` | 获取事件报文字段协议 | GET |
| 4 | `getIndexProperties` | 获取 ES 索引字段属性 | GET |
| 5 | `queryEvents` | 通用事件检索（分页+条件+排序） | POST |
| 6 | `statisticEvents` | 通用事件统计（分组+聚合） | POST |
| 7 | `searchEventCodes` | 按关键字搜索事件类型 | POST |

---

## 组件 → 数据源 对应关系

| 组件 | 数据方法 | 当前数据 |
|------|----------|----------|
| DashboardLayout (KPI) | `fetchKpiStats()` | mock |
| EventCategoryChart (饼图) | `fetchCategoryDistribution()` | mock |
| RankingList (TOP5) | `fetchRanking(5)` | mock |
| GrowthAnalysis (同比环比) | `fetchGrowthAnalysis()` | mock |
| AreaDistribution (近7天) | `fetchAreaTrend()` | mock |
| TrendComparison (周对比) | `fetchWeekComparison()` | mock |
| LatestCaptures (最新抓拍) | `fetchLatestCaptures(6)` | mock (5s 轮询) |
| DetailModal (详情) | `fetchDetailRecords(opts)` | mock |

---

## 如何切换到真实接口

### Step 1: 填入鉴权信息

编辑 `.env.development`：
```
VITE_ARTEMIS_GATEWAY=https://实际网关地址
VITE_APP_KEY=实际appKey
VITE_APP_SECRET=实际appSecret
```

### Step 2: 切换 `src/api/event.ts`

每个函数都有注释格式：
```ts
// [真实接口] ← 取消注释这里
// export async function queryEvents(params: QueryParams) {
//   return post<QueryResult>('/api/common/v1/query', params as ...)
// }

// [Mock] ← 注释掉这里
export async function queryEvents(_params: QueryParams) {
  return { code: '0', msg: 'SUCCESS', data: { total: 0, list: [] } }
}
```

### Step 3: 切换 `src/composables/useEventQuery.ts`

每个方法同理，取消注释 `[真实接口]` 部分，注释掉 mock return。

### Step 4: 验证

```bash
npm run dev
```
打开浏览器 Network 面板，确认 `/api/*` 请求返回 200。

---

## 开发命令

```bash
npm run dev        # 启动开发服务器（带 proxy）
npm run build      # 生产构建
npx vue-tsc --noEmit  # 类型检查
```

## 注意事项

- `.env.development` 和 `.env.production` 已加入 `.gitignore`，不会提交
- Vite proxy 只在开发环境生效，生产环境需用 Nginx 做反向代理
- 所有请求统一走 `/api` 前缀，proxy 会自动去除前缀并转发到海康网关
