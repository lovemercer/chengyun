# 城东区城市运行事件分析看板

## 项目定位
Vue 3 + TypeScript + Vite + ECharts 城市治理事件可视化大屏。

## 目录结构

```
dashboard/                        ← 主项目
  src/
    api/                          ← 海康接口层
      request.ts                  ← fetch 封装（鉴权 + 代理）
      event.ts                    ← 7 个海康 API 函数
    composables/
      useEventData.ts             ← 事件类型管理（单例）
      useEventQuery.ts            ← 看板数据查询
      useDetailModal.ts           ← 详情弹窗状态（单例）
      useReducedMotion.ts         ← 无障碍动画降级
    components/
      DashboardLayout.vue         ← 根布局（KPI + 三栏）
      left/                       ← 左栏面板
      right/                      ← 右栏面板
      DetailModal.vue             ← 详情/对比弹窗
    data/mockDetail.ts            ← Mock 数据生成
```

## 数据架构

- **当前状态**：全部 mock 数据驱动
- **真实 API 已就绪**：`src/api/event.ts` 和 `src/composables/useEventQuery.ts` 中真实接口代码已写好但注释掉
- **切换方式**：取消注释 `[真实接口]` 代码块，注释掉 `[Mock]` 代码块
- **代理**：Vite proxy 将 `/api/*` 转发到海康网关，自动附加 appKey/appSecret
- **原则**：不硬编码业务分类/地点，接口返回什么就显示什么

## 接口文档
- `artemis-api.yaml` — 海康开放平台原始接口定义（机器可读）
- `artemis-api.md` — 海康接口文档 Markdown 版（人类可读，7 个接口的完整参数/响应说明）
- `dashboard/API_INTEGRATION.md` — 对接说明（架构、切换步骤）

## 常用命令
```bash
npm run dev          # 开发（含 proxy）
npm run build        # 生产构建
npx vue-tsc --noEmit # 类型检查
```
