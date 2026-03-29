# AGENTS.md - QFNUQA 项目指南

## 项目概述

QFNUQA 是一个问答知识库应用。采用 TypeScript monorepo 架构，通过 npm workspaces 管理，前端使用 Next.js 14，后端使用 Express.js，数据库为 PostgreSQL。

## 仓库结构

```
apps/web/          # Next.js 14 前端 (App Router, MUI, Tailwind, React Query, Zustand)
apps/server/       # Express.js API 服务器 (ESM, tsx, pg)
packages/shared/   # 共享代码（目前为空）
database/sql/      # PostgreSQL 建表脚本 (init.sql) 和种子数据 (seed.sql)
docs/              # 需求文档和执行计划
```

## 构建与运行命令

```bash
# 安装依赖（在仓库根目录执行）
npm install

# 开发模式（同时启动 web + server）
npm run dev

# 开发模式（单独启动某个 workspace）
npm run dev:web          # Next.js 开发服务器，端口 :3000
npm run dev:server       # Express 通过 tsx watch 启动，端口 :3001

# 生产构建（所有 workspace）
npm run build

# 单独构建某个 workspace
npm run build --workspace=apps/web
npm run build --workspace=apps/server

# 启动生产服务器
npm run start --workspace=apps/server
```

## 代码检查与类型检查

```bash
# Lint（仅 Next.js 内置 ESLint）
npm run lint --workspace=apps/web

# 类型检查（不输出文件）
npx tsc --noEmit --project apps/web/tsconfig.json
npx tsc --noEmit --project apps/server/tsconfig.json
```

## 测试命令

**当前未配置测试框架。** 添加测试时建议使用 Vitest，以适配 ESM + TypeScript 环境：

```bash
# 推荐：运行所有测试（配置后）
npx vitest run

# 推荐：运行单个测试文件
npx vitest run apps/server/src/routes/qa.test.ts

# 推荐：按名称模式运行测试
npx vitest run -t "search QA"
```

## 代码风格指南

### TypeScript

- 两个 `tsconfig.json` 均开启 **严格模式**（`strict: true`）。
- 编译目标：`esnext`（web）、`ES2022`（server）。
- 仅用于类型的导入使用 `import type { ... }` 语法。

### 导入规范

- **第三方导入在前**，本地导入在后，中间空一行分隔。
- Server 端本地导入必须带 `.js` 后缀（ESM 要求）：
  ```typescript
  import { Router } from 'express';
  import { query, queryOne } from '../db/index.js';
  ```
- Web 端使用 `@/*` 路径别名，映射到 `./src/*`：
  ```typescript
  import { api } from '@/lib/api';
  import type { QA } from '@/types';
  ```

### 命名规范

| 元素 | 规范 | 示例 |
|------|------|------|
| React 组件 | PascalCase 文件名 + default export | `QACard.tsx` → `export default function QACard()` |
| 非组件文件 | camelCase | `quickLinks.ts`、`searchLogs.ts` |
| 接口/类型 | PascalCase | `QA`、`Category`、`Pagination` |
| 变量/函数 | camelCase | `fetchAPI`、`callZhipuAI`、`formatDate` |
| 数据库列名 | snake_case | `view_count`、`created_at`、`category_id` |
| API 路由 | kebab-case | `/api/quick-links`、`/api/search-logs` |
| 组件 Props 接口 | `{组件名}Props` | `QACardProps`、`QADetailDialogProps` |

### React 组件

- 所有交互组件使用 `'use client'` 指令。
- 页面和组件函数使用 default export。
- UI 使用 MUI 组件，样式使用 Tailwind 工具类。
- 状态管理：React Query 管理服务端状态，Zustand 管理客户端 UI 状态。

### Server 路由（Express）

所有路由处理器遵循以下模式：

```typescript
import { Router } from 'express';
import { query, queryOne } from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT ...');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error description:', error);
    res.status(500).json({ success: false, error: 'Error message' });
  }
});

export default router;
```

- 每个路由处理器必须使用 `try/catch`。
- 返回格式：`{ success: true, data }` 或 `{ success: false, error }`。
- 使用参数化查询（`$1`, `$2`, ...）—— 禁止字符串拼接 SQL。
- 使用 `db/index.js` 中的泛型 `query<T>()` 和 `queryOne<T>()` 辅助函数。

### 前端 API 客户端

```typescript
async function fetchAPI<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}
```

### 错误处理

- **Server 端**：每个路由处理器使用 try/catch，`console.error` 记录日志，返回结构化 JSON 错误响应。
- **前端**：使用 Next.js 错误边界文件（`error.tsx`、`global-error.tsx`）。
- **API 客户端**：非 ok 响应直接抛出异常，由 React Query 处理错误状态。

### 数据库

- 使用 PostgreSQL，驱动为 `pg`。
- 全文搜索通过 `tsvector` 实现，使用 `simple` 字典（支持中文）。
- 触发器自动更新 `keyword_vector` 和 `updated_at` 列。
- 建表脚本在 `database/sql/init.sql`，种子数据在 `database/sql/seed.sql`。

### 环境变量

- 服务器配置在 `apps/server/.env`（PostgreSQL 连接信息、智谱 AI API Key）。
- **禁止提交密钥。** `.env` 文件已在 `.gitignore` 中。

### 关键架构说明

- 开发环境下，`next.config.js` 将 `/api/*` 请求代理到 `http://localhost:3001/api/*`。
- AI 集成使用智谱 AI（GLM-4-flash 模型），代码在 `apps/server/src/routes/ai.ts`。
- `packages/shared/` 为空 —— 类型目前在前端 `apps/web/src/types/` 中定义。
- React Query `QueryClient` 配置：`staleTime: 60_000`、`refetchOnWindowFocus: false`。
- Tailwind `preflight` 已禁用，以兼容 MUI。
