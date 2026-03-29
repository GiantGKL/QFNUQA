# QFNUQA 免费部署方案需求文档

**日期**: 2026-03-29
**状态**: 待审批

## Goal

将 QFNUQA 项目（Next.js 14 + Express.js + PostgreSQL）免费部署到托管平台，支持国内访问，用于测试验证。

## Deliverable

一个可通过公网访问的在线版本，具备完整的 QA 浏览、搜索、AI 问答功能。

## 约束

- 费用：**完全免费**，不使用试用积分（会过期的不算）
- 国内访问：优先选择亚洲节点（香港/新加坡/东京）
- 运维：零运维，全托管平台
- 数据量：100 条 QA 以内
- 目的：先测试，非生产级别

## 平台调研结论

| 平台 | 免费可行？ | 国内访问 | Express 支持 | 持久 PostgreSQL |
|------|-----------|---------|-------------|----------------|
| Vercel + Supabase | ✅ 永久免费 | ❌ 慢/不稳定 | ❌ 需重构为 API Routes | ✅ Supabase 500MB |
| Render + Supabase | ✅ 永久免费 | ⚠️ 新加坡节点可接受 | ✅ 支持 | ✅ Supabase（Render自带DB 30天过期） |
| Zeabur | ❌ 已无免费 | ✅ 香港节点 | ✅ | ❌ 需自建 |
| Netlify | ✅ 但不能跑 Express | ❌ 慢 | ❌ | ❌ |
| Railway | ❌ 仅试用 | ❌ 免费无区域选择 | ✅ | ❌ |
| Fly.io | ❌ 需信用卡 | ✅ 东京/新加坡 | ✅ | ✅ |

## 推荐方案：Render (Web Services) + Supabase (PostgreSQL)

**选择理由：**
1. **完全免费且不过期** — Render free web service 750hrs/月 + Supabase free 500MB
2. **Express.js 原生支持** — 无需重构后端代码
3. **新加坡节点** — 国内访问 ~100-150ms，测试可接受
4. **代码改动最小** — 只需改环境变量和构建配置，不改架构

**取舍：**
- 冷启动：空闲 15 分钟后休眠，首次访问约 1 分钟（测试用途可接受）
- 国内速度：不如香港节点快，但测试够用
- 双服务占用 750 小时：Next.js(720h) + Express(720h) = 1440h，超出 750h 限额 → **需合并为单服务部署**

### 关键决策：合并为 Next.js 单服务

当前架构是 Next.js + Express 双服务，但 Render 免费 750 小时无法同时跑两个 24/7 服务。
解决方案：**将 Express 路由合并到 Next.js API Routes 中**，只部署一个 Next.js 服务。

这同时也解锁了 Vercel 部署的可能性（未来切换）。

## Acceptance Criteria

- [ ] Express 路由全部迁移到 Next.js API Routes
- [ ] Supabase 数据库创建完成，schema 和种子数据导入
- [ ] Render 部署成功，公网可访问
- [ ] QA 浏览、搜索、AI 问答功能正常
- [ ] 环境变量通过平台注入，无密钥泄露

## Non-Goals

- 高并发 / 生产级稳定性
- 自定义域名
- CDN 加速
- CI/CD 自动部署
