import { Router } from 'express';
import { query, queryOne } from '../db/index.js';

const router = Router();

// 获取 QA 列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      category,
      tag,
      sortBy = 'view_count',
      order = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);
    const validSortFields = ['view_count', 'updated_at', 'created_at'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'view_count';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    let sql = `
      SELECT
        q.id,
        q.question,
        q.answer,
        q.view_count,
        q.created_at,
        q.updated_at,
        c.id as category_id,
        c.name as category_name,
        COALESCE(
          json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM qa_items q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN qa_tags qt ON q.id = qt.qa_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND q.category_id = $${paramIndex++}`;
      params.push(category);
    }

    if (tag) {
      sql += ` AND EXISTS (
        SELECT 1 FROM qa_tags qt2
        WHERE qt2.qa_id = q.id AND qt2.tag_id = $${paramIndex++}
      )`;
      params.push(tag);
    }

    sql += `
      GROUP BY q.id, c.id, c.name
      ORDER BY q.${sortField} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(Number(pageSize), offset);

    const items = await query(sql, params);

    // 获取总数
    let countSql = 'SELECT COUNT(DISTINCT q.id) as total FROM qa_items q';
    const countParams: unknown[] = [];
    let countIndex = 1;

    if (category) {
      countSql += ` WHERE q.category_id = $${countIndex++}`;
      countParams.push(category);
    }

    if (tag) {
      if (category) {
        countSql += ' AND';
      } else {
        countSql += ' WHERE';
      }
      countSql += ` EXISTS (
        SELECT 1 FROM qa_tags qt
        WHERE qt.qa_id = q.id AND qt.tag_id = $${countIndex++}
      )`;
      countParams.push(tag);
    }

    const { total } = await queryOne<{ total: string }>(countSql, countParams) || { total: '0' };

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total: parseInt(total)
        }
      }
    });
  } catch (error) {
    console.error('Get QA list error:', error);
    res.status(500).json({ success: false, error: '获取列表失败' });
  }
});

// 搜索 QA
router.get('/search', async (req, res) => {
  try {
    const {
      keyword,
      page = 1,
      pageSize = 10,
      category,
      sortBy = 'relevance'
    } = req.query;

    if (!keyword) {
      return res.status(400).json({ success: false, error: '请输入搜索关键词' });
    }

    const offset = (Number(page) - 1) * Number(pageSize);

    let orderByClause = 'q.view_count DESC';
    if (sortBy === 'relevance') {
      orderByClause = `ts_rank(q.keyword_vector, plainto_tsquery('simple', $1)) DESC`;
    } else if (sortBy === 'updated_at') {
      orderByClause = 'q.updated_at DESC';
    }

    let sql = `
      SELECT
        q.id,
        q.question,
        q.answer,
        q.view_count,
        q.created_at,
        q.updated_at,
        c.id as category_id,
        c.name as category_name,
        ts_headline('simple', q.question, plainto_tsquery('simple', $1), 'MaxWords=35,MinWords=15') as highlighted_question,
        ts_headline('simple', q.answer, plainto_tsquery('simple', $1), 'MaxWords=50,MinWords=15') as highlighted_answer,
        COALESCE(
          json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM qa_items q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN qa_tags qt ON q.id = qt.qa_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.keyword_vector @@ plainto_tsquery('simple', $1)
    `;
    const params: unknown[] = [keyword];
    let paramIndex = 2;

    if (category) {
      sql += ` AND q.category_id = $${paramIndex++}`;
      params.push(category);
    }

    sql += `
      GROUP BY q.id, c.id, c.name
      ORDER BY ${orderByClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(Number(pageSize), offset);

    const items = await query(sql, params);

    res.json({
      success: true,
      data: {
        items,
        keyword,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize)
        }
      }
    });
  } catch (error) {
    console.error('Search QA error:', error);
    res.status(500).json({ success: false, error: '搜索失败' });
  }
});

// 获取单个 QA 详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 更新浏览量
    await query('UPDATE qa_items SET view_count = view_count + 1 WHERE id = $1', [id]);

    const sql = `
      SELECT
        q.id,
        q.question,
        q.answer,
        q.view_count,
        q.created_at,
        q.updated_at,
        c.id as category_id,
        c.name as category_name,
        COALESCE(
          json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM qa_items q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN qa_tags qt ON q.id = qt.qa_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.id = $1
      GROUP BY q.id, c.id, c.name
    `;

    const item = await queryOne(sql, [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: '未找到该问答' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Get QA detail error:', error);
    res.status(500).json({ success: false, error: '获取详情失败' });
  }
});

export default router;
