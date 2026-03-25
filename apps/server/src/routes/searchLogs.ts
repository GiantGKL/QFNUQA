import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// 记录搜索日志
router.post('/', async (req, res) => {
  try {
    const { keyword, resultCount } = req.body;

    if (!keyword) {
      return res.status(400).json({ success: false, error: '关键词不能为空' });
    }

    await query(
      'INSERT INTO search_logs (keyword, result_count) VALUES ($1, $2)',
      [keyword, resultCount || 0]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Log search error:', error);
    res.status(500).json({ success: false, error: '记录失败' });
  }
});

// 获取热门搜索（统计用）
router.get('/hot', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const sql = `
      SELECT keyword, COUNT(*) as count
      FROM search_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT $1
    `;

    const hotKeywords = await query(sql, [Number(limit)]);

    res.json({ success: true, data: hotKeywords });
  } catch (error) {
    console.error('Get hot searches error:', error);
    res.status(500).json({ success: false, error: '获取热门搜索失败' });
  }
});

export default router;
