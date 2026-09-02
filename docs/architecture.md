# 系统架构

QFNUQA 是一个 Nuxt 全栈应用。浏览器端由 Vue 单文件组件构成，Nitro 在同一进程中提供 API，避免跨服务部署与额外 CORS 配置。

## RAG 数据流

1. `/api/ai/search` 校验关键词并按客户端 IP 限流。
2. PostgreSQL 在一条查询中完成召回：`tsvector` 全文命中权重 3，问题/答案模糊命中权重 2，标签/分类命中权重 1。
3. 按相关度和浏览量排序，最多返回请求指定数量；前 5 条拼接为模型参考资料。
4. GLM-4-Flash 根据系统提示和参考资料生成回答。
5. AI 请求失败时接口仍返回知识库召回结果，页面可继续服务用户。

## API

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/api/qa` | 分页问答列表 |
| GET | `/api/qa/:id` | 问答详情与浏览计数 |
| GET | `/api/qa/search` | 全文索引搜索 |
| GET | `/api/ai/search` | RAG 智能搜索 |
| GET | `/api/categories` | 分类树 |
| GET | `/api/tags` | 标签列表 |
| GET | `/api/quick-links` | 校园快捷入口 |
| POST | `/api/search-logs` | 记录搜索 |
| GET | `/api/search-logs/hot` | 七日热搜 |

## 安全策略

- SQL 参数化与排序字段白名单。
- 搜索词 200 字上限、分页最大 50 条。
- AI 接口每 IP 每分钟 10 次。
- Markdown 禁止原始 HTML，并使用安全链接协议校验。
- 数据库密钥与 AI 密钥仅存在于服务端环境变量。
