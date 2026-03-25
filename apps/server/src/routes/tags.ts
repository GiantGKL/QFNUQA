import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// 获取标签列表
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        t.id,
        t.name,
        (SELECT COUNT(*) FROM qa_tags WHERE tag_id = t.id) as qa_count
      FROM tags t
      ORDER BY qa_count DESC, t.name
    `;

    const tags = await query(sql);

    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ success: false, error: '获取标签失败' });
  }
});

export default router;
