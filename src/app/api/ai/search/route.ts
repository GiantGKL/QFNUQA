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
  relevance: number;
}

const SYSTEM_PROMPT = `你是曲阜师范大学的智能问答助手，名叫"曲小问"。你的职责是与学生对话并解答他们的问题。

规则：
1. 如果「参考资料」中有相关信息，请以此为主，综合整理后给出准确回答。
2. 如果「参考资料」中没有相关信息，就根据你的知识尽量回答，并在末尾标注"（以上信息非官方确认，建议查阅学校官网核实）"。
3. 即使是闲聊、打招呼，也要友好地回应，然后引导用户提问。
4. 回答要简洁明了，条理清晰，适合学生阅读。
5. 涉及以下官方信息时优先使用：
   - 教务系统：http://zhjw.qfnu.edu.cn
   - 图书馆：https://lib.qfnu.edu.cn
   - 一网通办：https://ids.qfnu.edu.cn
   - 教务处：https://jwc.qfnu.edu.cn
   - 校历：https://jwc.qfnu.edu.cn/info/1091/7292.htm
   - 智慧曲园APP：查成绩、课表等`;

export async function GET(request: NextRequest) {
  try {
    // 限流：每 IP 每分钟 10 次
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
    const pageSize = Math.min(
      Math.max(Number(searchParams.get('pageSize') || '6'), 1),
      50
    );

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '请输入搜索关键词' },
        { status: 400 }
      );
    }

    if (keyword.length > 200) {
      return NextResponse.json(
        { success: false, error: '关键词长度不能超过200字' },
        { status: 400 }
      );
    }

    const keywordStr = String(keyword);
    const ilikePattern = `%${keywordStr}%`;

    // 多路召回：GIN 全文搜索 + ILIKE 模糊匹配 + 标签名匹配 + 分类名匹配
    // relevance: 3=全文索引命中, 2=ILIKE 命中, 1=标签/分类命中
    const sql = `
      WITH matched AS (
        SELECT
          q.id,
          q.question,
          q.answer,
          q.view_count,
          q.created_at,
          q.updated_at,
          c.id AS category_id,
          c.name AS category_name,
          COALESCE(
            json_agg(json_build_object('id', t.id, 'name', t.name))
              FILTER (WHERE t.id IS NOT NULL),
            '[]'
          ) AS tags,
          CASE
            WHEN q.keyword_vector @@ plainto_tsquery('simple', $1) THEN 3
            WHEN q.question ILIKE $2 OR q.answer ILIKE $2 THEN 2
            ELSE 1
          END AS relevance
        FROM qa_items q
        LEFT JOIN categories c ON q.category_id = c.id
        LEFT JOIN qa_tags qt ON q.id = qt.qa_id
        LEFT JOIN tags t ON qt.tag_id = t.id
        WHERE
          q.keyword_vector @@ plainto_tsquery('simple', $1)
          OR q.question ILIKE $2
          OR q.answer ILIKE $2
          OR EXISTS (
            SELECT 1 FROM qa_tags qt2
            JOIN tags t2 ON qt2.tag_id = t2.id
            WHERE qt2.qa_id = q.id AND t2.name ILIKE $2
          )
          OR c.name ILIKE $2
        GROUP BY q.id, c.id, c.name
      )
      SELECT * FROM matched
      ORDER BY relevance DESC, view_count DESC
      LIMIT $3
    `;

    const items = await query<QAItem>(sql, [keywordStr, ilikePattern, pageSize]);

    // 构造 AI 上下文：取最相关的 top 5
    let contextBlock = '';
    if (items.length > 0) {
      contextBlock = '参考资料：\n\n';
      items.slice(0, 5).forEach((qa, i) => {
        contextBlock += `【${i + 1}】问：${qa.question}\n答：${qa.answer}\n\n`;
      });
    }

    // AI 必须回答，不管有没有搜索结果
    const messages: ZhipuMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: contextBlock
          ? `${contextBlock}用户问题：${keywordStr}`
          : keywordStr,
      },
    ];

    let aiSummary: string | null = null;
    try {
      aiSummary = await callZhipuAI(messages);
    } catch (e) {
      console.error('AI call failed:', e);
      // AI 挂了也要给用户有用信息
      if (items.length > 0) {
        aiSummary = null; // 不显示废话，让卡片自己说话
      }
      // 没有搜索结果且 AI 挂了，前端会显示"没有找到"
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
