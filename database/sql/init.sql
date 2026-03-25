-- =====================================================
-- QFNUQA 数据库初始化脚本
-- 曲阜师范大学 QA 问答平台
-- 数据库: PostgreSQL 12+
-- 注意: 此版本不包含 pgvector（向量搜索）
-- =====================================================

-- =====================================================
-- 1. 分类表
-- =====================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categories IS 'QA分类表';
COMMENT ON COLUMN categories.parent_id IS '父分类ID，支持多级分类';

-- =====================================================
-- 2. 标签表
-- =====================================================
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tags IS '标签表';

-- =====================================================
-- 3. 问答表（核心表）
-- =====================================================
CREATE TABLE qa_items (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    view_count INTEGER DEFAULT 0,
    -- PostgreSQL 全文搜索
    keyword_vector tsvector,
    -- AI 语义向量（需要安装 pgvector 后手动添加）
    -- embedding vector(1536),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE qa_items IS 'QA问答表';
COMMENT ON COLUMN qa_items.keyword_vector IS '全文搜索向量';
-- COMMENT ON COLUMN qa_items.embedding IS 'AI语义向量，用于相似度搜索';

-- 全文搜索触发器（自动更新 keyword_vector）
CREATE OR REPLACE FUNCTION update_qa_keyword_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.keyword_vector :=
        to_tsvector('simple', COALESCE(NEW.question, '')) ||
        to_tsvector('simple', COALESCE(NEW.answer, ''));
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_qa_keyword_vector
    BEFORE INSERT OR UPDATE ON qa_items
    FOR EACH ROW
    EXECUTE FUNCTION update_qa_keyword_vector();

-- =====================================================
-- 4. 问答-标签关联表
-- =====================================================
CREATE TABLE qa_tags (
    qa_id INTEGER NOT NULL REFERENCES qa_items(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (qa_id, tag_id)
);

COMMENT ON TABLE qa_tags IS '问答与标签的多对多关联表';

-- =====================================================
-- 5. 快捷入口表
-- =====================================================
CREATE TABLE quick_links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    url TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE quick_links IS '首页快捷入口按钮';

-- =====================================================
-- 6. 搜索日志表
-- =====================================================
CREATE TABLE search_logs (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    result_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE search_logs IS '搜索日志，用于统计分析热门搜索';

-- =====================================================
-- 索引
-- =====================================================

-- 全文搜索索引
CREATE INDEX idx_qa_keyword_vector ON qa_items USING GIN(keyword_vector);

-- 向量搜索索引（需要安装 pgvector 后手动添加）
-- CREATE INDEX idx_qa_embedding ON qa_items USING hnsw (embedding vector_cosine_ops);

-- 排序索引
CREATE INDEX idx_qa_view_count ON qa_items(view_count DESC);
CREATE INDEX idx_qa_updated_at ON qa_items(updated_at DESC);

-- 分类查询索引
CREATE INDEX idx_qa_category_id ON qa_items(category_id);

-- 快捷入口排序索引
CREATE INDEX idx_quick_links_sort ON quick_links(sort_order);

-- 搜索日志时间索引
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at DESC);

-- 标签名称索引
CREATE INDEX idx_tags_name ON tags(name);

-- =====================================================
-- 更新时间触发器函数（通用）
-- =====================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要自动更新的表添加触发器
CREATE TRIGGER trigger_categories_timestamp
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_quick_links_timestamp
    BEFORE UPDATE ON quick_links
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =====================================================
-- 完成
-- =====================================================
-- 执行成功后可运行以下命令验证:
-- \dt           - 查看所有表
-- \di           - 查看所有索引
-- \df           - 查看所有函数
