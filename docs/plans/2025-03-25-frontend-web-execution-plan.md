# 前端网页端 - 执行计划

## 内部执行等级: L
多阶段开发任务，需要后端 + 前端协调，分 wave 执行

## 执行阶段

### Wave 1: 项目初始化
**Owner**: 主代理

#### 任务
1. 创建 monorepo 结构
2. 初始化 Next.js 前端 (`apps/web`)
3. 初始化 Express 后端 (`apps/server`)
4. 配置共享类型定义

#### 验证命令
```bash
cd apps/web && npm run dev    # 前端启动
cd apps/server && npm run dev # 后端启动
```

---

### Wave 2: 后端 API 开发
**Owner**: 主代理
**依赖**: Wave 1

#### 任务
1. 数据库连接配置 (pg)
2. 实现 QA 相关 API
3. 实现分类/标签 API
4. 实现快捷入口 API
5. 实现搜索功能

#### 验证命令
```bash
curl http://localhost:3001/api/quick-links
curl http://localhost:3001/api/qa
curl http://localhost:3001/api/categories
```

---

### Wave 3: 前端页面开发
**Owner**: 主代理
**依赖**: Wave 2

#### 任务
1. 布局组件 (Header, Container)
2. 搜索框组件
3. 快捷入口组件
4. QA 卡片组件
5. 分类筛选组件
6. 首页整合

#### 验证
- 浏览器访问 http://localhost:3000
- 测试搜索、筛选功能

---

### Wave 4: 样式与优化
**Owner**: 主代理
**依赖**: Wave 3

#### 任务
1. MUI 主题配置
2. 响应式布局
3. 加载状态处理
4. 错误处理

---

## 产出物
- `apps/web/` - Next.js 前端
- `apps/server/` - Express 后端
- `package.json` - monorepo 配置

## 回滚规则
如果某阶段失败，删除对应的 `apps/` 子目录

## 清理预期
- 无临时文件
- 安装依赖后可删除 node_modules/.cache
