import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
      return NextResponse.json({ success: false, error: '未找到该问答' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Get QA detail error:', error);
    return NextResponse.json({ success: false, error: '获取详情失败' }, { status: 500 });
  }
}
