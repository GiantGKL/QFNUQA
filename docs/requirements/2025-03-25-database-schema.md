# QFNUQA 数据库结构需求文档

## 项目概述
曲阜师范大学 QA 问答平台数据库设计

## 目标
创建 PostgreSQL 数据库表结构，支持 QA 问答系统的核心功能

## 交付物
- `database/sql/init.sql` - 完整建表脚本
- `database/sql/seed.sql` - 示例数据（可选）

## 约束条件
- 数据库：PostgreSQL 12+
- 需要扩展：pgvector（向量搜索）
- 编码：UTF-8

## 数据表设计

### 1. categories（分类表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| name | VARCHAR(100) | 分类名称 |
| description | TEXT | 描述 |
| icon | VARCHAR(50) | 图标标识 |
| sort_order | INTEGER | 排序 |
| parent_id | INTEGER | 父分类ID（支持子分类）|

### 2. tags（标签表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| name | VARCHAR(50) | 标签名 |

### 3. qa_items（问答表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| question | TEXT | 问题 |
| answer | TEXT | 答案 |
| category_id | INTEGER | 分类ID |
| view_count | INTEGER | 浏览量 |
| keyword_vector | tsvector | 全文搜索向量 |
| embedding | vector(1536) | AI语义向量（预留）|
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 4. qa_tags（问答-标签关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| qa_id | INTEGER | 问答ID |
| tag_id | INTEGER | 标签ID |

### 5. quick_links（快捷入口表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| name | VARCHAR(100) | 名称 |
| icon | VARCHAR(50) | 图标 |
| url | TEXT | 链接 |
| description | TEXT | 描述 |
| sort_order | INTEGER | 排序 |
| is_active | BOOLEAN | 是否启用 |

### 6. search_logs（搜索日志表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| keyword | VARCHAR(255) | 搜索关键词 |
| result_count | INTEGER | 结果数 |
| created_at | TIMESTAMP | 时间 |

## 索引设计
- 全文搜索：GIN 索引 on keyword_vector
- 排序：B-Tree 索引 on view_count, updated_at
- 分类查询：B-Tree 索引 on category_id

## 验收标准
- [ ] 所有表创建成功
- [ ] 索引创建成功
- [ ] 外键约束正确
- [ ] SQL 语法正确可执行

## 非目标
- 用户系统表（后续扩展）
- 应用层代码
- 数据填充脚本

## 假设
- 后续会使用 OpenAI 或类似 API 生成 embedding
- 前端使用搜索框调用后端 API
