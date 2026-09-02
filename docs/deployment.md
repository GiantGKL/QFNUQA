# Render 部署

## 服务配置

- Runtime: Node
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start`
- Health path: `/`

Nuxt/Nitro 会自动读取 Render 的 `PORT` 并绑定服务。

## 环境变量

```env
NODE_VERSION=20.19.0
DATABASE_URL=postgresql://...
ZHIPU_API_KEY=...
ZHIPU_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

线上数据库启用 TLS；连接池在生产环境限制为单连接，以适配免费托管资源。部署后依次检查首页、`/api/qa?page=1&pageSize=1` 与一次 AI 搜索。
