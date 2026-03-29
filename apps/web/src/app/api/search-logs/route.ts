import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: globalThis.Request) {
  try {
    const body = await request.json();
    const { keyword, resultCount } = body;

    if (!keyword) {
      return NextResponse.json({ success: false, error: '缺少关键词' }, { status: 400 });
    }

    await query(
      'INSERT INTO search_logs (keyword, result_count) VALUES ($1, $2)',
      [keyword, resultCount ?? 0]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log search error:', error);
    return NextResponse.json({ success: false, error: '记录搜索日志失败' }, { status: 500 });
  }
}
