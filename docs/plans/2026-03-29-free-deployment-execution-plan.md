# QFNUQA 免费部署执行计划

**日期**: 2026-03-29
**内部等级**: L（单阶段执行，无并行）
**关联需求**: `docs/requirements/2026-03-29-free-deployment.md`

## 概述

将 Express.js 后端迁移到 Next.js API Routes，实现单服务部署到 Render + Supabase。

## Wave 结构

```
Wave 1: 基础设施准备
├── Task 1.1: Supabase 项目创建 + 数据库初始化
├── Task 1.2: Render 项目创建 + 环境变量配置
└── 验证: 数据库可连接，Render 项目就绪

Wave 2: 代码迁移
├── Task 2.1: 创建 Next.js 数据库连接层
├── Task 2.2: 迁移 qa.ts → /api/qa/*
├── Task 2.3: 迁移 quickLinks.ts → /api/quick-links
├── Task 2.4: 迁移 categories.ts → /api/categories
├── Task 2.5: 迁移 tags.ts → /api/tags
├── Task 2.6: 迁移 ai.ts → /api/ai/*
├── Task 2.7: 迁移 searchLogs.ts → /api/search-logs
└── 验证: 本地 `npm run build` 通过，API 可用

Wave 3: 前端适配
├── Task 3.1: 删除 next.config.js 中的 rewrites 代理
├── Task 3.2: 更新前端 API 调用路径（已是相对路径，无需改动）
├── Task 3.3: 添加环境变量处理（DATABASE_URL 等）
└── 验证: 本地完整功能测试通过

Wave 4: 部署上线
├── Task 4.1: 推送代码到 GitHub
├── Task 4.2: Render 连接仓库并部署
├── Task 4.3: 验证线上功能
└── 验证: 公网可访问，功能正常
```

## 详细任务

### Wave 1: 基础设施准备

#### Task 1.1: Supabase 项目创建

**执行者**: 用户（需要手动操作）
**步骤**:
1. 访问 https://supabase.com 注册/登录
2. 创建新项目：
   - 名称: `qfnuqa`
   - 区域: **Singapore (Southeast Asia)**
   - 数据库密码: 自定义强密码（记录下来）
3. 等待项目初始化完成（约 2 分钟）
4. 获取连接信息：
   - Settings → Database → Connection string → URI
   - 格式: `postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
5. 执行 SQL：
   - SQL Editor → 粘贴 `database/sql/init.sql` → Run
   - SQL Editor → 粘贴 `database/sql/seed.sql` → Run

**产出**: 
- DATABASE_URL 环境变量值

#### Task 1.2: Render 项目创建

**执行者**: 用户（需要手动操作）
**步骤**:
1. 访问 https://render.com 注册/登录
2. 创建 Web Service：
   - Connect GitHub 仓库 `GiantGKL/QFNUQA`
   - Name: `qfnuqa`
   - Region: **Singapore (Southeast Asia)**
   - Branch: `main`
   - Root Directory: `apps/web`
   - Runtime: **Node**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
3. 添加环境变量：
   - `DATABASE_URL`: [Supabase 连接字符串]
   - `ZHIPU_API_KEY`: [智谱 API Key]
   - `ZHIPU_API_URL`: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
   - `NODE_ENV`: `production`

**产出**:
- Render 项目 URL（如 `https://qfnuqa.onrender.com`）

---

### Wave 2: 代码迁移

#### Task 2.1: 创建 Next.js 数据库连接层

**文件**: `apps/web/src/lib/db.ts`

```typescript
import pg from 'pg';

const { Pool } = pg;

// Supabase 连接池模式（transaction 模式用于 serverless）
const connectionString = process.env.DATABASE_URL!;

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase 需要 SSL
  max: 1, // serverless 环境限制连接数
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
}
```

**依赖**: 需要在 `apps/web/package.json` 添加 `pg` 依赖

#### Task 2.2: 迁移 qa.ts

**目标文件**:
- `apps/web/src/app/api/qa/route.ts` - GET 列表
- `apps/web/src/app/api/qa/search/route.ts` - GET 搜索
- `apps/web/src/app/api/qa/[id]/route.ts` - GET 详情

**改动**: Express Router → Next.js Route Handlers

#### Task 2.3: 迁移 quickLinks.ts

**目标文件**: `apps/web/src/app/api/quick-links/route.ts`

#### Task 2.4: 迁移 categories.ts

**目标文件**: `apps/web/src/app/api/categories/route.ts`

#### Task 2.5: 迁移 tags.ts

**目标文件**: `apps/web/src/app/api/tags/route.ts`

#### Task 2.6: 迁移 ai.ts

**目标文件**:
- `apps/web/src/app/api/ai/search/route.ts` - GET
- `apps/web/src/app/api/ai/ask/route.ts` - POST

#### Task 2.7: 迁移 searchLogs.ts

**目标文件**:
- `apps/web/src/app/api/search-logs/route.ts` - POST
- `apps/web/src/app/api/search-logs/hot/route.ts` - GET

---

### Wave 3: 前端适配

#### Task 3.1: 删除代理配置

**文件**: `apps/web/next.config.js`

删除 `rewrites` 配置块（API 现在在同一服务内）

#### Task 3.2: 验证前端 API 调用

检查 `apps/web/src/lib/api.ts` 和组件中的 fetch 调用，确保使用相对路径（`/api/xxx`）

#### Task 3.3: 更新 package.json

在 `apps/web/package.json` 添加：
- `pg` 依赖
- 启动脚本 `next start`

---

### Wave 4: 部署上线

#### Task 4.1: 推送代码

```bash
git add .
git commit -m "feat: 迁移 Express 路由到 Next.js API Routes，支持单服务部署"
git push origin main
```

#### Task 4.2: Render 自动部署

Render 会自动检测 push 并重新部署。

#### Task 4.3: 验证

1. 访问 Render 分配的 URL
2. 测试功能：
   - 首页加载
   - QA 列表分页
   - 搜索功能
   - AI 问答
   - 快捷入口

---

## 验证命令

```bash
# 本地构建测试
cd apps/web && npm run build

# 本地运行测试（需要先设置环境变量）
DATABASE_URL="..." ZHIPU_API_KEY="..." npm run start

# 类型检查
npx tsc --noEmit --project apps/web/tsconfig.json
```

## 回滚规则

如果部署失败：
1. Render 支持一键回滚到上一个成功的部署
2. Git revert 本次提交

## Phase Cleanup 期望

- [ ] 删除 `apps/server` 目录（或保留但不部署）
- [ ] 更新根 `package.json` 的 scripts
- [ ] 更新 `AGENTS.md` 部署说明
- [ ] 清理临时文件

## 风险点

1. **Supabase 连接池**: serverless 环境需使用 transaction 模式连接字符串（端口 6543）
2. **冷启动**: 首次访问可能需 30 秒，测试用途可接受
3. **SSL 证书**: Supabase 强制 SSL，需配置 `ssl: { rejectUnauthorized: false }`
