import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 记录搜索日志
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, resultCount } = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '关键词不能为空' },
        { status: 400 }
      );
    }

    await query(
      'INSERT INTO search_logs (keyword, result_count) VALUES ($1, $2)',
      [keyword, resultCount || 0]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log search error:', error);
    return NextResponse.json(
      { success: false, error: '记录失败' },
      { status: 500 }
    );
  }
}
