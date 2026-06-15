# 海康 Artemis 开放平台 — 事件服务接口文档

> 来源：`artemis-api.yaml`，version 3.6.9，provider: eventlib-spi / eventlib-search

---

## 目录

1. [全域事件库事件类型获取](#1-全域事件库事件类型获取)
2. [全域事件库事件类型详细信息获取](#2-全域事件库事件类型详细信息获取)
3. [全域事件库目标事件报文协议获取](#3-全域事件库目标事件报文协议获取)
4. [根据事件类型ID获取ES字段属性列表](#4-根据事件类型id获取es字段属性列表)
5. [通用事件检索](#5-通用事件检索)
6. [通用事件统计](#6-通用事件统计)
7. [通过事件名称或事件码获取事件列表](#7-通过事件名称或事件码获取事件列表)

---

## 1. 全域事件库事件类型获取

获取事件库中所有事件列表，可指定是否过滤未接入事件上报任务的事件。

| 属性 | 值 |
|------|-----|
| **路径** | `POST /api/v1/dataEvent/getAllEventBasicInfo` |
| **后端服务** | `GET /eventlib-spi/v1/dataEvent/getAllEventBasicInfo` |
| **超时** | 10000ms |
| **最低版本** | 1.2.100 |

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `filterNoEventTask` | Boolean | 否 | false | 过滤未接入任务事件，非 true 值自动转为 false |

### 响应示例

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": [
    {
      "id": 1,
      "eventTableIndexCode": "2bb71ba2-cafe-4469-a68b-653fee946943",
      "name": "人脸视频分析事件"
    }
  ]
}
```

### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | Number | 返回码 |
| `msg` | String | 消息 |
| `data[].id` | Number | 自增id |
| `data[].eventTableIndexCode` | String | 事件模型编码（唯一标识） |
| `data[].name` | String | 事件模型名称 |

---

## 2. 全域事件库事件类型详细信息获取

通过事件模型编码，获取事件模型的详细信息，包括关联的事件上报任务、消息中间件、存储信息等。

| 属性 | 值 |
|------|-----|
| **路径** | `POST /api/v1/dataEvent/getEventDetailInfoByIds` |
| **后端服务** | `POST /eventlib-spi/v1/dataEvent/getEventDetailInfoByIds` |
| **Content-Type** | `application/json` |
| **超时** | 10000ms |
| **最低版本** | 1.2.100 |

### 请求参数（Body — application/json）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `eventTableIndexCodes` | String[] | 是 | 事件模型编码列表 |
| `filterNoEventTask` | Boolean | 否 | 过滤未接入任务事件，默认 false |

### 请求示例

```json
{
  "eventTableIndexCodes": ["2bb71ba2-cafe-4469-a68b-653fee946943"],
  "filterNoEventTask": false
}
```

### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | String | 错误码 |
| `msg` | String | 返回描述 |
| `data[].id` | Number | 自增id |
| `data[].eventTableIndexCode` | String | 事件唯一id |
| `data[].name` | String | 事件名称 |
| `data[].esIndexName` | String | ES索引名称 |
| `data[].esAliasName` | String | ES索引别名 |
| `data[].kafkaTopicName` | String | Kafka topic名称 |
| `data[].rmqTopicName` | String | RabbitMQ topic名称 |
| `data[].exchange` | String | RabbitMQ exchange |
| `data[].routingKey` | String | RabbitMQ routingKey |
| `data[].connectionMode` | String | RabbitMQ connectionMode |
| `data[].resourceInfos` | Array | Kafka/ES/RabbitMQ资源连接信息 |
| `data[].resourceInfos[].resourceIndexCode` | String | 资源内部编码 |
| `data[].resourceInfos[].resourceName` | String | 资源名称：kafka / elasticsearch / rabbitmq |
| `data[].resourceInfos[].properties` | Object | 连接地址配置 |
| `data[].sceneInfos` | Array | 场景列表 |
| `data[].sceneInfos[].sceneId` | String | 场景id |
| `data[].sceneInfos[].sceneNameStrand` | String | 场景名称连接（@分隔） |
| `data[].sceneInfos[].sceneIdStrand` | String | 场景id连接（@分隔） |

---

## 3. 全域事件库目标事件报文协议获取

通过事件模型编码，获取事件报文协议（字段定义）。

| 属性 | 值 |
|------|-----|
| **路径** | `GET /api/v1/dataTable/getEventMqField` |
| **后端服务** | `GET /eventlib-spi/v1/dataTable/linkEngine/getEventMqField` |
| **超时** | 10000ms |
| **最低版本** | 1.2.100 |

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `eventTableIndexCode` | String | 是 | 事件模型编码 |

### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.jsonModel` | String | 报文模式（JSON） |
| `data.schemaModel` | String | Schema模式 |
| `data.fieldList[].fieldName` | String | 字段名称 |
| `data.fieldList[].fieldNumber` | String | 字段序号 |
| `data.fieldList[].fieldIndexCode` | String | 字段唯一编码 |
| `data.fieldList[].fieldParentIndexCode` | String | 父级字段编码 |
| `data.fieldList[].fieldType` | String | 字段类型（STRING等） |
| `data.fieldList[].fieldSize` | String | 字段长度 |
| `data.fieldList[].fieldNote` | String | 字段说明 |
| `data.fieldList[].fieldChoice` | String | 字段可选/必选（true/false） |
| `data.fieldList[].regularChoice` | String | 关联字段是否必选：-1可选，1必选 |
| `data.fieldList[].children` | Array | 子字段 |
| `data.fieldList[].eventTableIndexCode` | String | 事件模型编码 |

---

## 4. 根据事件类型ID获取ES字段属性列表

根据事件类型id获取该事件类型在ES中的字段属性列表，用于了解可查询/可展示的字段。

| 属性 | 值 |
|------|-----|
| **路径** | `GET /api/v1/dataEvent/getIndexProperties` |
| **后端服务** | `GET /eventlib-spi/v1/dataEvent/getIndexProperties` |
| **超时** | 10000ms |
| **最低版本** | 1.2.1 |

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `eventTableIndexCode` | String | **是** | 事件模型编码 |

### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.esIndexName` | String | ES索引名称 |
| `data.esAliasName` | String | 索引别名 |
| `data.cols[].propertiesEnName` | String | ES字段英文名称 |
| `data.cols[].propertiesZhName` | String | 中文名称 |
| `data.cols[].propertiesAliasName` | String | ES别名（如 sys_exclusive_indexCode） |
| `data.cols[].type` | String | 字段类型（long / keyword / double / integer / nested） |

> **关键用途**：查询事件数据前，先调此接口获取该事件类型的字段列表，确认有哪些字段可用于过滤和展示。

---

## 5. 通用事件检索

通用事件检索，支持分页、多条件过滤、排序。

| 属性 | 值 |
|------|-----|
| **路径** | `POST /api/common/v1/query` |
| **后端服务** | `POST /eventlib-search/common/v1/query` |
| **Content-Type** | `application/json` |
| **超时** | 10000ms |
| **最低版本** | 1.2.100 |

### 请求参数（Body — application/json）

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `eventName` | String | 是 | — | 要查询的事件名称，取值为ES索引名前缀（去掉时间戳部分），只支持单个事件 |
| `eventKeys` | String | 否 | — | 事件标识，与 eventName 必须填一个 |
| `returnFields` | String | 否 | `"*"` | 返回字段，`*` 表示所有，指定字段用逗号分隔 |
| `pageNo` | Number | 否 | 1 | 页码（不能小于1） |
| `pageSize` | Number | 否 | 10 | 每页数量（不能小于1） |
| `fieldOptions` | Array | 否 | — | 查询条件，多个之间为 **and** 关系 |
| `fieldMultipleOptions` | Array | 否 | — | 复合关系 `and` / `or` / `not` |
| `sort` | Array | 否 | — | 排序条件 |

### fieldOptions 子字段

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `fieldName` | String | 条件字段名 |
| `value` | String | 条件值 |
| `type` | String | 过滤条件类型（见下表） |

### type 可用值

| type | 说明 | 示例 |
|------|------|------|
| `terms` | 等于（单值匹配） | `"face"` |
| `in` | 多值匹配 | `"val1,val2"` 逗号分隔 |
| `like` | 模糊匹配 | `"人脸"` |
| `lt` | 小于 | `"1000"` |
| `le` | 小于等于 | `"1000"` |
| `gt` | 大于 | `"500"` |
| `ge` | 大于等于 | `"500"` |
| `range` | 范围匹配 | `[1000,2000]` — `(,)` `[,]` 开闭区间组合 |
| `timeRange` | 时间范围 | `[2022-05-20T13:29:35.000+08:00, 2022-05-22T13:29:35.000+08:00]` |

> 注意：同一字段不可同时设置 `range` 和 `lt/le/gt/ge`。

### sort 子字段

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `method` | String | `desc` 或 `asc` |
| `column` | String | 排序字段 |

### 请求示例

```json
{
  "returnFields": "*",
  "eventName": "xvehicle.bayonet_vehiclealarm",
  "pageNo": 1,
  "pageSize": 10,
  "fieldOptions": [
    { "fieldName": "portNo", "value": "8001", "type": "in" }
  ]
}
```

### 响应

```json
{
  "code": "0",
  "msg": "SUCCESS",
  "data": {
    "total": 1000,
    "list": [
      { "key": "name", "value": "face" }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.total` | Number | 总条数 |
| `data.list` | Array | 每条记录为 key-value 的 map 结构 |

---

## 6. 通用事件统计

通用事件统计，支持分组聚合、条件过滤。

| 属性 | 值 |
|------|-----|
| **路径** | `POST /api/common/v1/statistic` |
| **后端服务** | `POST /eventlib-search/common/v1/statistic` |
| **Content-Type** | `application/json` |
| **超时** | 10000ms |
| **最低版本** | 1.2.100 |

### 请求参数（Body — application/json）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `eventName` | String | **是** | ES索引名称 |
| `maxRows` | Number | **是** | 返回结果最大行数 |
| `fieldOptions` | Array | **是** | 列过滤条件，多个列之间为 and 关系 |
| `aggCols` | Array | **是** | 聚合列配置 |
| `groupByCols` | String | **是** | 分组列名，多个列名用逗号分隔 |

### fieldOptions 子字段（同 API 5）

### aggCols 子字段

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `name` | String | 是 | 列名 |
| `aggFunc` | String | 是 | 聚合函数名，目前仅支持 `sum` |

### 请求示例

```json
{
  "eventName": "xsearch_face_snap_video",
  "maxRows": 100,
  "fieldOptions": [
    { "fieldName": "value", "value": "10", "type": "ge" }
  ],
  "aggCols": [
    { "name": "value", "aggFunc": "sum" }
  ],
  "groupByCols": "srcIndex"
}
```

### 响应

```json
{
  "code": "0",
  "msg": "SUCCESS",
  "data": {
    "total": 100,
    "list": [
      {
        "colName": "name",
        "value": "150.54",
        "aggType": "groupBy",
        "docCount": 1,
        "children": [
          { "colName": "value", "value": "150.54", "aggType": "sum" }
        ]
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.total` | Number | 总条数 |
| `data.list[].colName` | String | 列名 |
| `data.list[].value` | String | 聚合结果值 |
| `data.list[].docCount` | Number | 分组内总数（仅分组列有此字段） |
| `data.list[].aggType` | String | 聚合类型（groupBy / sum） |
| `data.list[].children` | Array | 子聚合结果（aggCols 中配置的聚合列） |

> **关键用途**：KPI 计数、按类型/区域/时间分组统计全部走这个接口。

---

## 7. 通过事件名称或事件码获取事件列表

按关键字搜索事件名称或事件编码。

| 属性 | 值 |
|------|-----|
| **路径** | `POST /api/eventCode/v1/searchEventCodes` |
| **后端服务** | `POST /eventlib-spi/v1/event/searchEventCodes` |
| **Content-Type** | `application/json` |
| **超时** | 10000ms |
| **最低版本** | 1.2.100 |

### 请求参数（Body — application/json）

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `keyword` | String | 否 | — | 关键字搜索 |
| `pageNo` | Number | 否 | 1 | 页数 |
| `pageSize` | Number | 否 | 20 | 分页大小 |

### 请求示例

```json
{ "pageSize": 20, "pageNo": 1, "keyword": "人脸" }
```

### 响应

```json
{
  "code": "0",
  "msg": "SUCCESS",
  "data": {
    "pageNo": 1,
    "pageSize": 20,
    "total": 1,
    "totalPage": 1,
    "list": [
      { "eventName": "人脸视频分析事件", "eventCode": "" }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.pageNo` | Number | 页码 |
| `data.pageSize` | Number | 页大小 |
| `data.total` | Number | 总数 |
| `data.totalPage` | Number | 总页数 |
| `data.list[].eventName` | String | 事件名称 |
| `data.list[].eventCode` | String | 事件十进制编码 |

---

## 接口间调用关系

```
API 1 / API 7 ──→ 获取 eventTableIndexCode（事件类型编码）
                        │
                        ├──→ API 2  获取事件详情（ES/Kafka/RabbitMQ 连接信息）
                        ├──→ API 3  获取事件报文字段定义
                        ├──→ API 4  获取 ES 字段属性（用于构造查询条件）
                        │
                        └──→ API 5  通用事件检索（分页查询事件数据）
                             API 6  通用事件统计（分组聚合，KPI + 图表数据）
```
