import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const sortBy = searchParams.get('sortBy') || 'view_count';
    const order = searchParams.get('order') || 'DESC';

    const offset = (Number(page) - 1) * Number(pageSize);
    const validSortFields = ['view_count', 'updated_at', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'view_count';
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

    return NextResponse.json({
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
    return NextResponse.json({ success: false, error: '获取列表失败' }, { status: 500 });
  }
}
