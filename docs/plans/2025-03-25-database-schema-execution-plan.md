# 数据库结构创建 - 执行计划

## 内部执行等级: M
单一任务，单文件创建，无需多代理协作

## 执行阶段

### Wave 1: 核心建表脚本
**Owner**: 主代理
**Task**: 创建 `database/sql/init.sql`

#### 步骤
1. 创建 pgvector 扩展启用语句
2. 按依赖顺序创建表：
   - categories（无依赖）
   - tags（无依赖）
   - qa_items（依赖 categories）
   - qa_tags（依赖 qa_items, tags）
   - quick_links（无依赖）
   - search_logs（无依赖）
3. 创建索引
4. 添加注释

#### 验证命令
```bash
psql -U postgres -d qfnuqa -f database/sql/init.sql
```

#### 回滚规则
如果执行失败，删除 `database/sql/init.sql`

## 产出物
- `database/sql/init.sql` - 主建表脚本

## 清理预期
- 无临时文件
- 无节点残留
