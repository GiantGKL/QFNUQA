import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 获取快捷入口列表
export async function GET() {
  try {
    const sql = `
      SELECT id, name, icon, url, description, sort_order
      FROM quick_links
      WHERE is_active = true
      ORDER BY sort_order, id
    `;

    const links = await query(sql);

    return NextResponse.json({ success: true, data: links });
  } catch (error) {
    console.error('Get quick links error:', error);
    return NextResponse.json(
      { success: false, error: '获取快捷入口失败' },
      { status: 500 }
    );
  }
}
