# ElderEscort API 协议 v1.1

Base URL: `/api/v1`

---

## 通用约定

### 请求格式

- `Content-Type: application/json`

### 成功响应

```json
{
  "code": 200,
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": 404,
  "message": "string"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | int | 与 HTTP 状态码一致 |
| `message` | string | 人类可读的错误描述 |

---

## 接口列表

### 1. 欺诈文本分析

```
POST /api/v1/analysis
```

**请求体**

```json
{
  "text": "语音识别后的文本内容"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | ✅ | 待分析的文本 |

**响应（命中欺诈）**

```json
{
  "code": 200,
  "data": {
    "isFraud": true,
    "confidence": 0.95,
    "warningMessage": "检测到虚假夸大宣传！",
    "targetArticleId": 1
  }
}
```

**响应（未命中）**

```json
{
  "code": 200,
  "data": {
    "isFraud": false,
    "confidence": 0.02
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `isFraud` | bool | ✅ | 是否命中欺诈 |
| `confidence` | float | ✅ | 置信度 0~1，非命中时也返回 |
| `warningMessage` | string | 命中时必填 | 前端弹窗展示的警告文案 |
| `targetArticleId` | int | 命中时必填 | 关联的科普文章 ID，前端用于"查看防骗真相"跳转 |

---

### 2. 科普文章列表

```
GET /api/v1/articles?page=1&pageSize=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|------|
| `page` | int | 否 | 1 | 页码 |
| `pageSize` | int | 否 | 10 | 每页条数 |

**响应**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "警惕"包治百病"骗局",
        "summary": "不法分子常利用"包治百病"等夸大宣传语欺骗老年人购买高价保健品，了解常见骗术，守护您的健康与财产。"
      }
    ],
    "total": 35,
    "page": 1,
    "pageSize": 10
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `list` | array | 当前页文章列表 |
| `list[].id` | int | 文章唯一 ID |
| `list[].title` | string | 文章标题 |
| `list[].summary` | string | 摘要，卡片列表展示用 |
| `total` | int | 文章总数 |
| `page` | int | 当前页码 |
| `pageSize` | int | 每页条数 |

---

### 3. 文章详情

```
GET /api/v1/articles/:id
```

**响应（成功）**

```json
{
  "code": 200,
  "data": {
    "title": "警惕"包治百病"骗局",
    "content": "近年来，一些不法分子利用老年人对健康的渴望...\n\n请记住：世上没有包治百病的神药。"
  }
}
```

**响应（文章不存在）**

```json
{
  "code": 404,
  "message": "文章未找到"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 文章标题 |
| `content` | string | 正文，`\n` 表示换行，前端渲染为 `<br>` |

---

## 变更记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.1 | 2026-05-17 | 补充置信度字段、文章列表分页、统一错误格式 |
| v1.0 | 2026-05-17 | 初始版本，三个核心接口 |
