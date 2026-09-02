# QFNUQA 开发指南

## 技术边界

- 使用 Nuxt 4、Vue 3、TypeScript 与 Composition API。
- 页面与组件位于 `app/`，服务端路由位于 `server/api/`。
- API 成功响应保持 `{ success: true, data }`，失败响应保持 `{ success: false, error }`。
- 所有 SQL 必须参数化；可变排序字段必须先经过白名单。
- 环境变量和密钥不得提交。

## 常用命令

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run build
npm run start
```

## 编码约定

- Vue 组件使用 PascalCase `.vue` 文件和 `<script setup lang="ts">`。
- 共享前端类型放在 `app/types/`，纯函数放在对应 `utils/`。
- Nitro 端点按 `*.get.ts`、`*.post.ts` 命名，每个处理器包含明确错误响应。
- 交互控件必须支持键盘访问并提供可读的 `aria-label`。
- 修改 RAG 查询时保留召回来源优先级，并为参数边界补充 Vitest 测试。
