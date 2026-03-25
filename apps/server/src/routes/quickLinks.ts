import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// 获取快捷入口列表
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT id, name, icon, url, description, sort_order
      FROM quick_links
      WHERE is_active = true
      ORDER BY sort_order, id
    `;

    const links = await query(sql);

    res.json({ success: true, data: links });
  } catch (error) {
    console.error('Get quick links error:', error);
    res.status(500).json({ success: false, error: '获取快捷入口失败' });
  }
});

export default router;
