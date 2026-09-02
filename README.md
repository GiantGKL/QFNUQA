# 曲园智答 QFNUQA

面向曲阜师范大学学生的智能知识问答平台。系统以 PostgreSQL 校园知识库为依据，通过全文索引、模糊匹配、标签和分类完成多路召回，再由 GLM-4-Flash 生成简洁、可追溯的回答。

## 核心能力

- 多路 RAG 召回：GIN 全文索引、ILIKE 模糊搜索、标签匹配与分类匹配统一排序。
- 智能回答：优先依据 Top 5 知识片段生成答案，模型不可用时仍展示召回内容。
- 校园知识浏览：热门问答、详情浏览、访问计数和分页。
- 使用效率：本周热搜、搜索日志、校历与教务系统等快捷入口。
- 安全与稳定：参数白名单、SQL 参数化、长度限制、IP 频率限制和安全 Markdown 渲染。
- 响应式体验：键盘可操作的卡片与弹窗、移动端适配、减少动画偏好支持。

## 技术架构

| 层级 | 技术 |
| --- | --- |
| Web | Nuxt 4、Vue 3、TypeScript、Composition API |
| Server | Nitro / H3 server routes |
| RAG | PostgreSQL `tsvector` + GIN、ILIKE、标签/分类召回 |
| AI | 智谱 GLM-4-Flash |
| 数据 | PostgreSQL / Supabase |
| 测试 | Vitest、Vue Test Utils、happy-dom |
| 部署 | Render 单服务 |

## 目录

```text
app/                 Vue 页面、组件、样式与前端类型
server/api/          Nitro API 路由
server/utils/        数据库、AI、限流与参数校验
database/sql/        建表、索引、触发器和种子数据
docs/                架构与部署说明
```

## 本地运行

要求 Node.js 20.19+。未配置数据库时，开发服务器会自动使用内置演示知识库，方便直接预览全部交互。

```bash
npm install
```

连接真实知识库时创建 `.env`：

```env
DATABASE_URL=postgresql://postgres@127.0.0.1:5432/qfnuqa
ZHIPU_API_KEY=your_api_key
ZHIPU_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

也可以设置 `DEMO_MODE=true` 强制使用演示数据，或设置 `DEMO_MODE=false` 强制检查数据库配置。生产环境不会自动启用演示模式。

使用真实数据库时先初始化：

```bash
psql -U postgres -d qfnuqa -f database/sql/init.sql
psql -U postgres -d qfnuqa -f database/sql/seed.sql
```

启动开发服务器：

```bash
npm run dev
```

## 质量检查

```bash
npm run test
npm run typecheck
npm run build
```

完整 API 与部署约定见 [架构说明](docs/architecture.md) 和 [部署指南](docs/deployment.md)。

问答内容参考 [Easy-QFNU Wiki](https://v1.wiki.easy-qfnu.top/)，重要信息请以学校官方渠道为准。

## License

MIT
