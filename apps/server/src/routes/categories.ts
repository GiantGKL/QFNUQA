import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// 获取分类列表
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        c1.id,
        c1.name,
        c1.description,
        c1.icon,
        c1.sort_order,
        c1.parent_id,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c2.id,
              'name', c2.name,
              'sort_order', c2.sort_order
            )
            ORDER BY c2.sort_order
          ) FILTER (WHERE c2.id IS NOT NULL),
          '[]'
        ) as children,
        (SELECT COUNT(*) FROM qa_items WHERE category_id = c1.id) as qa_count
      FROM categories c1
      LEFT JOIN categories c2 ON c2.parent_id = c1.id
      WHERE c1.parent_id IS NULL
      GROUP BY c1.id
      ORDER BY c1.sort_order, c1.id
    `;

    const categories = await query(sql);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: '获取分类失败' });
  }
});

export default router;
