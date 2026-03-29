# QFNUQA 免费部署执行计划

**日期**: 2026-03-29
**内部等级**: L（设计 → 实施 → 审查）
**状态**: 待审批

## 概述

将 Express.js 路由迁移到 Next.js API Routes，部署到 Render + Supabase。

## 迁移映射

| Express 路由 | Next.js API Route | 方法 |
|---|---|---|
| `GET /api/qa` | `src/app/api/qa/route.ts` | GET |
| `GET /api/qa/search` | `src/app/api/qa/search/route.ts` | GET |
| `GET /api/qa/:id` | `src/app/api/qa/[id]/route.ts` | GET |
| `GET /api/categories` | `src/app/api/categories/route.ts` | GET |
| `GET /api/tags` | `src/app/api/tags/route.ts` | GET |
| `GET /api/quick-links` | `src/app/api/quick-links/route.ts` | GET |
| `GET /api/ai/search` | `src/app/api/ai/search/route.ts` | GET |
| `POST /api/ai/ask` | `src/app/api/ai/ask/route.ts` | POST |
| `POST /api/search-logs` | `src/app/api/search-logs/route.ts` | POST |

## Wave 结构

### Wave 1: 基础设施（Next.js 侧）

1. **创建数据库连接模块** `src/lib/db.ts`
   - 将 `apps/server/src/db/index.ts` 的 `pool`、`query`、`queryOne` 迁移到 `apps/web/src/lib/db.ts`
   - 使用环境变量连接（Supabase 或本地 PostgreSQL）

2. **创建 AI 工具模块** `src/lib/ai.ts`
   - 将 `callZhipuAI` 函数从 `ai.ts` 提取为独立模块

### Wave 2: 路由迁移（9 个路由文件）

3. 逐个创建 Next.js API Route 文件，每个文件对应一个 Express 路由处理器
   - 简单路由：quickLinks, categories, tags, searchLogs（直接复制 SQL + 逻辑）
   - 复杂路由：qa（分页+过滤）, qa/search（全文搜索）, qa/[id]（详情+浏览量）
   - AI 路由：ai/search, ai/ask（提取 AI 调用逻辑）

### Wave 3: 配置调整

4. **修改 `next.config.js`** — 移除 rewrites 代理（API Routes 已内置）
5. **添加 `pg` 依赖到 `apps/web/package.json`**
6. **验证本地运行** — 确保 `npm run dev:web` 所有 API 正常

### Wave 4: 部署

7. **Supabase 设置** — 创建项目（新加坡区域）、执行 init.sql + seed.sql
8. **Render 部署** — 连接 GitHub 仓库、配置构建命令和环境变量
9. **端到端验证** — 公网访问测试所有功能

## 验证命令

```bash
# Wave 3 本地验证
npm run dev:web
# 测试所有 API endpoints
curl http://localhost:3000/api/qa
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/tags
curl http://localhost:3000/api/quick-links
curl http://localhost:3000/api/ai/search?keyword=教务系统
curl http://localhost:3000/api/qa/1
```

## 回滚规则

- 每个 Wave 完成后 git commit
- 如果迁移失败，Express 服务器代码不删除，可随时切回
- `apps/server/` 保持不变，只是不再部署它

## 清理期望

- 迁移完成后 `apps/server/` 可选删除（或保留作为参考）
- `next.config.js` 的 rewrites 移除
- 无临时文件残留
