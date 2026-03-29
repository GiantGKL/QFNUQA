import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 搜索 QA
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'relevance';

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '请输入搜索关键词' },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      data: {
        items,
        keyword,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
        },
      },
    });
  } catch (error) {
    console.error('Search QA error:', error);
    return NextResponse.json(
      { success: false, error: '搜索失败' },
      { status: 500 }
    );
  }
}
