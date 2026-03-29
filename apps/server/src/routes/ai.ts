import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ZhipuResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

async function callZhipuAI(messages: ZhipuMessage[]): Promise<string> {
  // 添加超时控制
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15秒超时

  try {
    const response = await fetch(process.env.ZHIPU_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4.7-flash',
        messages,
        temperature: 0.7,
        max_tokens: 512, // 减少输出长度，加快响应
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API Error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as ZhipuResponse;
    return data.choices[0]?.message?.content || '抱歉，AI 暂时无法回答。';
  } catch (error) {
    clearTimeout(timeout);
    if ((error as Error).name === 'AbortError') {
      throw new Error('AI 请求超时');
    }
    throw error;
  }
}

// AI 智能搜索（合并 AI 回答 + 相关 QA）
router.get('/search', async (req, res) => {
  try {
    const { keyword, pageSize = 6 } = req.query;

    if (!keyword) {
      return res.status(400).json({ success: false, error: '请输入搜索关键词' });
    }

    const searchTerm = `%${keyword}%`;

    // 使用 LIKE 模糊搜索（支持中文）
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
      WHERE q.question ILIKE $1 OR q.answer ILIKE $1
      GROUP BY q.id, c.id, c.name
      ORDER BY q.view_count DESC
      LIMIT $2
    `;

    const items = await query(sql, [searchTerm, Number(pageSize)]);

    // 调用 AI 回答
    let aiSummary = null;

    let context = '';
    if (items.length > 0) {
      context = '以下是数据库中与用户问题相关的问答，请参考这些信息：\n\n';
      items.slice(0, 5).forEach((qa, i) => {
        context += `【${i + 1}】问：${qa.question}\n答：${qa.answer}\n\n`;
      });
    }

    const systemPrompt = `你是曲阜师范大学的智能问答助手。
请根据用户问题和提供的参考资料，给出准确、友好、有帮助的回答。
${items.length > 0 ? '优先参考提供的问答数据来回答。' : '数据库中没有直接相关的问答，请根据你的知识回答，但要说明这不是官方信息。'}
回答要简洁明了，适合学生阅读。`;

    try {
      aiSummary = await callZhipuAI([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: items.length > 0
            ? `${context}\n用户问题：${keyword}`
            : String(keyword),
        },
      ]);
    } catch (e) {
      console.error('AI call failed:', e);
      aiSummary = items.length > 0
        ? '找到了一些相关的问答，请查看下方卡片。'
        : '抱歉，没有找到相关的问答信息。';
    }

    res.json({
      success: true,
      data: {
        items,
        keyword,
        aiSummary,
      },
    });
  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ success: false, error: '搜索失败' });
  }
});

// 单独的 AI 问答接口（保留）
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: '请输入问题' });
    }

    const searchTerm = `%${question}%`;

    // 使用 LIKE 模糊搜索
    const searchSql = `
      SELECT question, answer
      FROM qa_items
      WHERE question ILIKE $1 OR answer ILIKE $1
      ORDER BY view_count DESC
      LIMIT 5
    `;
    const relatedQA = await query<{ question: string; answer: string }>(searchSql, [searchTerm]);

    let context = '';
    if (relatedQA.length > 0) {
      context = '以下是一些可能相关的问答，请参考这些信息回答用户问题：\n\n';
      relatedQA.forEach((qa, i) => {
        context += `【问答${i + 1}】\n问：${qa.question}\n答：${qa.answer}\n\n`;
      });
    }

    const systemPrompt = `你是曲阜师范大学的智能问答助手。请根据用户问题和提供的参考资料，给出准确、友好的回答。
如果参考资料中没有相关信息，请根据你的知识回答，但要说明这不是官方信息。
回答要简洁明了，适合学生阅读。`;

    const messages: ZhipuMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (context) {
      messages.push({
        role: 'user',
        content: `${context}\n用户问题：${question}`,
      });
    } else {
      messages.push({
        role: 'user',
        content: question,
      });
    }

    const aiAnswer = await callZhipuAI(messages);

    res.json({
      success: true,
      data: {
        answer: aiAnswer,
        relatedQA: relatedQA.length > 0,
      },
    });
  } catch (error) {
    console.error('AI ask error:', error);
    res.status(500).json({ success: false, error: 'AI 服务暂时不可用' });
  }
});

export default router;
