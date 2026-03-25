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
  const response = await fetch(process.env.ZHIPU_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API Error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as ZhipuResponse;
  return data.choices[0]?.message?.content || '抱歉，AI 暂时无法回答。';
}

// AI 智能问答
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: '请输入问题' });
    }

    // 1. 先搜索相关 QA
    const searchSql = `
      SELECT question, answer
      FROM qa_items
      WHERE keyword_vector @@ plainto_tsquery('simple', $1)
      ORDER BY ts_rank(keyword_vector, plainto_tsquery('simple', $1)) DESC
      LIMIT 5
    `;
    const relatedQA = await query<{ question: string; answer: string }>(searchSql, [question]);

    // 2. 构建上下文
    let context = '';
    if (relatedQA.length > 0) {
      context = '以下是一些可能相关的问答，请参考这些信息回答用户问题：\n\n';
      relatedQA.forEach((qa, i) => {
        context += `【问答${i + 1}】\n问：${qa.question}\n答：${qa.answer}\n\n`;
      });
    }

    // 3. 调用 AI
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

// AI 搜索增强
router.get('/search', async (req, res) => {
  try {
    const { keyword, page = 1, pageSize = 10 } = req.query;

    if (!keyword) {
      return res.status(400).json({ success: false, error: '请输入搜索关键词' });
    }

    // 1. 数据库搜索
    const offset = (Number(page) - 1) * Number(pageSize);
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
        ts_rank(q.keyword_vector, plainto_tsquery('simple', $1)) as relevance,
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
      ORDER BY relevance DESC
      LIMIT $2 OFFSET $3
    `;

    const items = await query(sql, [keyword, Number(pageSize), offset]);

    // 2. AI 总结（仅在有结果时）
    let aiSummary = null;
    if (items.length > 0) {
      const qaContext = items
        .slice(0, 3)
        .map((qa) => `问：${qa.question}\n答：${qa.answer}`)
        .join('\n\n');

      const summaryPrompt = `用户搜索了"${keyword}"，以下是搜索结果摘要。请用1-2句话总结这些信息的关键点，帮助用户快速了解：\n\n${qaContext}`;

      try {
        aiSummary = await callZhipuAI([
          {
            role: 'system',
            content: '你是一个简洁的信息总结助手。请用1-2句话总结关键信息。',
          },
          { role: 'user', content: summaryPrompt },
        ]);
      } catch {
        // AI 总结失败不影响主流程
      }
    }

    res.json({
      success: true,
      data: {
        items,
        keyword,
        aiSummary,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
        },
      },
    });
  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ success: false, error: '搜索失败' });
  }
});

export default router;
