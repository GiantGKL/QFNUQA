import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

// 获取标签列表
export async function GET() {
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

    return NextResponse.json(
      { success: true, data: tags },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { success: false, error: '获取标签失败' },
      { status: 500 }
    );
  }
}
