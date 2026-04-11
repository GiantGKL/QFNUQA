import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 获取热门搜索
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || '10'), 1), 20);

    const sql = `
      SELECT keyword, COUNT(*) as count
      FROM search_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT $1
    `;

    const hotKeywords = await query(sql, [limit]);

    return NextResponse.json({ success: true, data: hotKeywords });
  } catch (error) {
    console.error('Get hot searches error:', error);
    return NextResponse.json(
      { success: false, error: '获取热门搜索失败' },
      { status: 500 }
    );
  }
}
