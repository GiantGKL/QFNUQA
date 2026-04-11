# QFNUQA - 曲阜师范大学智能问答平台

基于大语言模型与全文检索的校园智能问答平台。采用知识库检索增强（RAG）思路，结合 PostgreSQL 全文索引实现多路召回，接入智谱 AI 生成自然语言回答。

## 功能特性

- 🔍 **AI 智能搜索** - 基于智谱 AI GLM-4-Flash 模型，多路召回（GIN 全文索引 + ILIKE 模糊匹配 + 标签 + 分类），有资料时基于资料回答，无资料时基于模型知识回答
- 📚 **知识库问答** - 21+ 条来自 Easy-QFNU Wiki 的真实校园问答
- 🔥 **热门搜索** - 展示高频搜索词，一键搜索
- 📄 **Markdown 渲染** - AI 回答支持 Markdown 格式 + XSS 防护
- 📑 **分页浏览** - 每页 9 条，支持翻页
- 🔗 **快捷入口** - 校历、教务系统、图书馆等常用链接
- 🔒 **安全加固** - API 限流、分页上限、参数校验、SQL 参数化查询

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router)、MUI (Material UI)、Tailwind CSS、React Query |
| 后端 | Next.js API Routes、智谱 AI GLM-4-Flash |
| 数据库 | PostgreSQL、GIN 全文索引 (tsvector) |
| 部署 | Render（免费托管）+ Supabase（免费 PostgreSQL） |

## 项目结构

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页（搜索 + 列表）
│   │   └── api/                  # API Routes
│   │       ├── qa/               # QA 增删改查 + 搜索
│   │       ├── ai/search/        # AI 智能搜索（多路召回 + AI 生成）
│   │       ├── categories/       # 分类
│   │       ├── tags/             # 标签
│   │       ├── quick-links/      # 快捷入口
│   │       └── search-logs/      # 搜索日志 + 热门搜索
│   ├── components/               # React 组件
│   ├── lib/
│   │   ├── db.ts                 # PostgreSQL 连接池
│   │   ├── ai.ts                 # 智谱 AI 调用封装
│   │   ├── api.ts                # 前端 API 客户端
│   │   └── rate-limit.ts         # 内存限流器
│   └── types/                    # TypeScript 类型定义
├── database/sql/
│   ├── init.sql                  # 建表语句 + 索引 + 触发器
│   └── seed.sql                  # 种子数据
└── docs/                         # 需求文档和执行计划
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 14+

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库连接（本地开发）
DATABASE_URL=postgresql://postgres@127.0.0.1:5432/qfnuqa

# AI 配置
ZHIPU_API_KEY=your_api_key
ZHIPU_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### 初始化数据库

```bash
# 创建数据库
psql -U postgres -c "CREATE DATABASE qfnuqa;"

# 执行建表脚本
psql -U postgres -d qfnuqa -f database/sql/init.sql

# 导入种子数据
psql -U postgres -d qfnuqa -f database/sql/seed.sql
```

### 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/qa` | GET | 获取 QA 列表（支持分页、分类筛选、排序） |
| `/api/qa/:id` | GET | 获取 QA 详情（含浏览量 +1） |
| `/api/qa/search` | GET | GIN 全文索引搜索 |
| `/api/ai/search` | GET | AI 智能搜索（多路召回 + AI 生成回答） |
| `/api/categories` | GET | 获取分类列表 |
| `/api/tags` | GET | 获取标签列表 |
| `/api/quick-links` | GET | 获取快捷入口 |
| `/api/search-logs` | POST | 记录搜索日志 |
| `/api/search-logs/hot` | GET | 获取热门搜索词 |

## 数据来源

问答数据来源于 [Easy-QFNU Wiki](https://v1.wiki.easy-qfnu.top/) by W1ndys，涵盖新生入学、校园生活、教务系统、学习考试四大类别。

## License

MIT
