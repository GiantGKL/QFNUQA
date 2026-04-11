import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { callZhipuAI } from '@/lib/ai';
import type { ZhipuMessage } from '@/lib/ai';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

interface QAItem {
  id: number;
  question: string;
  answer: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  category_id: number | null;
  category_name: string | null;
  tags: { id: number; name: string }[];
}

// AI 智能搜索
export async function GET(request: NextRequest) {
  try {
    // 限流检查：每分钟最多 10 次
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`ai-search:${clientIP}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const pageSize = Math.min(Math.max(Number(searchParams.get('pageSize') || '6'), 1), 50);

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '请输入搜索关键词' },
        { status: 400 }
      );
    }

    // 限制关键词长度
    if (keyword.length > 200) {
      return NextResponse.json(
        { success: false, error: '关键词长度不能超过200字' },
        { status: 400 }
      );
    }

    const keywordStr = String(keyword);

    // 第一步：使用 GIN 全文索引快速搜索（替代 ILIKE 全表扫描）
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
      WHERE q.keyword_vector @@ plainto_tsquery('simple', $1)
      GROUP BY q.id, c.id, c.name
      ORDER BY ts_rank(q.keyword_vector, plainto_tsquery('simple', $1)) DESC
      LIMIT $2
    `;

    let items = await query<QAItem>(sql, [keywordStr, pageSize]);

    // 如果全文搜索没结果，回退到 ILIKE 模糊匹配
    if (items.length === 0) {
      const fallbackSql = `
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
        WHERE q.question ILIKE $1 OR q.answer ILIKE $1
        GROUP BY q.id, c.id, c.name
        ORDER BY q.view_count DESC
        LIMIT $2
      `;
      items = await query<QAItem>(fallbackSql, [`%${keywordStr}%`, pageSize]);
    }

    // 调用 AI 生成摘要
    let aiSummary = null;

    let context = '';
    if (items.length > 0) {
      context = '以下是数据库中与用户问题相关的问答，请参考这些信息：\n\n';
      items.slice(0, 5).forEach((qa: QAItem, i: number) => {
        context += `【${i + 1}】问：${qa.question}\n答：${qa.answer}\n\n`;
      });
    }

    const systemPrompt = `你是曲阜师范大学的智能问答助手。
请根据用户问题和提供的参考资料，给出准确、友好、有帮助的回答。
回答要简洁明了，适合学生阅读。

以下是一些固定的官方信息，请优先使用：
- 教务系统网址：http://zhjw.qfnu.edu.cn
- 图书馆网址：https://lib.qfnu.edu.cn
- 一网通办：https://ids.qfnu.edu.cn
- 教务处官网：https://jwc.qfnu.edu.cn
- 校历：https://jwc.qfnu.edu.cn/info/1091/7292.htm
- 智慧曲园APP：用于查成绩、课表等

${
  items.length > 0
    ? '以下是数据库中与用户问题相关的问答，请参考：\n' + context
    : '数据库中没有直接相关的问答，请根据你的知识回答。'
}`;

    try {
      aiSummary = await callZhipuAI([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            items.length > 0
              ? `${context}\n用户问题：${keyword}`
              : String(keyword),
        },
      ]);
    } catch (e) {
      console.error('AI call failed:', e);
      aiSummary =
        items.length > 0
          ? '找到了相关的问答，请查看下方卡片了解详情。'
          : null;
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        keyword,
        aiSummary,
      },
    });
  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json(
      { success: false, error: '搜索失败' },
      { status: 500 }
    );
  }
}
