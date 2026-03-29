# QFNUQA 部署指南

## 第一部分：创建 Supabase 数据库

### 步骤 1：注册 Supabase

1. 访问 https://supabase.com
2. 点击 **Start your project** 用 GitHub 账号登录

### 步骤 2：创建项目

1. 点击 **New Project**
2. 填写：
   - **Name**: `qfnuqa`
   - **Database Password**: 设一个密码（记住它，后面要用）
   - **Region**: 选择 **Singapore** (东南亚)
3. 点击 **Create new project**，等待约 2 分钟

### 步骤 3：导入数据库

1. 项目创建完成后，点击左侧 **SQL Editor**
2. 点击 **New query**
3. 把 `database/sql/init.sql` 的**全部内容**粘贴进去
4. 点击 **Run**，等待执行完成
5. 再点 **New query**，粘贴 `database/sql/seed.sql` 的**全部内容**
6. 点击 **Run**，等待执行完成

### 步骤 4：获取连接信息

1. 点击左侧 **Project Settings**（齿轮图标）
2. 点击 **Database**
3. 找到 **Connection string** 部分，选择 **URI** 格式
4. 复制连接字符串，格式类似：
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
5. 把 `[YOUR-PASSWORD]` 替换为你设置的真实密码

---

## 第二部分：部署到 Render

### 步骤 1：注册 Render

1. 访问 https://render.com
2. 用 GitHub 账号登录

### 步骤 2：创建 Web Service

1. 点击 **New +** → **Web Service**
2. 选择 **Build and deploy from a Git repository**
3. 连接你的 GitHub 仓库 `GiantGKL/QFNUQA`
4. 填写配置：
   - **Name**: `qfnuqa`
   - **Root Directory**: `apps/web`
   - **Runtime**: **Node**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: **Free**
5. 先不要点 **Create Web Service**，先配置环境变量

### 步骤 3：配置环境变量

在 **Environment** 部分，添加以下变量：

| Key | Value | 说明 |
|-----|-------|------|
| `DB_HOST` | `aws-0-ap-southeast-1.pooler.supabase.com` | Supabase 连接字符串的 host 部分 |
| `DB_PORT` | `6543` | Supabase pooler 端口 |
| `DB_USER` | `postgres.xxxxx` | Supabase 连接字符串的 user 部分 |
| `DB_PASSWORD` | 你设置的数据库密码 | |
| `DB_NAME` | `postgres` | Supabase 默认数据库名 |
| `DB_SSL` | `true` | Supabase 需要 SSL |
| `ZHIPU_API_KEY` | `d236a2158468484e9bcbed208c1e313a.WxEsFn31Svj0xfYH` | 智谱 AI Key |
| `ZHIPU_API_URL` | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | 智谱 API 地址 |

> **如何获取 DB 连接参数**：从 Supabase 的连接字符串拆分：
> ```
> postgresql://postgres.abc123:MyPassword@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
>           ├── DB_USER ──────┘                ├── DB_HOST ────────────────────────┘└─ DB_PORT
>                      └── DB_PASSWORD ──┘                                                              └── DB_NAME
> ```

### 步骤 4：部署

1. 点击 **Create Web Service**
2. Render 会自动开始构建和部署（约 3-5 分钟）
3. 等待部署状态变为 **Live**
4. 访问 Render 分配的 URL（类似 `https://qfnuqa.onrender.com`）

---

## 验证清单

部署完成后，依次测试：

- [ ] 首页能正常显示
- [ ] 快捷入口显示正确
- [ ] 热门问答卡片显示
- [ ] 分页切换正常
- [ ] 点击卡片能打开详情
- [ ] 搜索功能正常（输入"教务系统"测试）
- [ ] AI 回答显示正常
- [ ] 页脚感谢链接正常

## 注意事项

- Render 免费服务在 **15 分钟无访问后会休眠**，首次访问需等待约 30 秒唤醒
- Supabase 免费数据库在 **7 天无活动后会暂停**，需要手动恢复
- Render 免费服务每月 **750 小时**（够一个服务 24/7 运行）
- Supabase 免费提供 **500MB** 存储空间
