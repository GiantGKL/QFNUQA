# QFNUQA - 曲阜师范大学智能问答平台

基于 Next.js 14 和 Express.js 构建的校园问答知识库应用。

## 功能特性

- 🔍 **AI 智能搜索** - 基于智谱 AI GLM-4.7-Flash 模型的智能问答
- 📚 **知识库问答** - 21+ 条来自 Easy-QFNU Wiki 的真实校园问答
- 📄 **Markdown 渲染** - AI 回答支持 Markdown 格式
- 📑 **分页浏览** - 每页 9 条，支持翻页
- 🔗 **快捷入口** - 校历、教务系统、图书馆等常用链接

## 技术栈

| 前端 | 后端 | 数据库 |
|------|------|--------|
| Next.js 14 | Express.js | PostgreSQL |
| MUI (Material UI) | tsx | pg |
| Tailwind CSS | 智谱 AI API | 全文搜索 (tsvector) |
| React Query | ESM | |
| Zustand | | |

## 项目结构

```
├── apps/
│   ├── web/           # Next.js 14 前端
│   └── server/        # Express.js 后端
├── database/sql/      # 数据库脚本
│   ├── init.sql       # 建表语句
│   └── seed.sql       # 种子数据
├── docs/              # 需求文档
└── AGENTS.md          # 项目开发指南
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

在 `apps/server/` 目录下创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=qfnuqa

# 服务器配置
PORT=3001
NODE_ENV=development

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
# 同时启动前端和后端
npm run dev

# 或单独启动
npm run dev:web      # 前端 http://localhost:3000
npm run dev:server   # 后端 http://localhost:3001
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/qa` | GET | 获取 QA 列表（支持分页） |
| `/api/qa/:id` | GET | 获取 QA 详情 |
| `/api/qa/search` | GET | 关键词搜索 |
| `/api/ai/search` | GET | AI 智能搜索 |
| `/api/categories` | GET | 获取分类列表 |
| `/api/tags` | GET | 获取标签列表 |
| `/api/quick-links` | GET | 获取快捷入口 |

## 数据来源

问答数据来源于 [Easy-QFNU Wiki](https://v1.wiki.easy-qfnu.top/)，涵盖了新生入学、校园生活、教务系统、学习考试等常见问题。

## License

MIT
