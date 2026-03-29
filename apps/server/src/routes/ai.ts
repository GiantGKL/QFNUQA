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
        model: 'glm-4-flash',
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

    const keywordStr = String(keyword);
    
    // 提取核心关键词
    const stopWords = ['网址', '地址', '怎么', '如何', '什么', '哪里', '能不能', '可以吗', '吗', '呢', '的', '是', '是啥', '请问', '告诉我', '我想知道'];
    let cleanedKeyword = keywordStr;
    for (const word of stopWords) {
      cleanedKeyword = cleanedKeyword.replace(new RegExp(word, 'g'), ' ');
    }
    
    // 提取关键词（分词）
    const keywords = cleanedKeyword.split(/\s+/).filter(w => w.length > 0);
    
    // 额外提取重要关键词（即使没有空格分隔）
    const importantKeywords: string[] = [];
    const importantPatterns = ['教务系统', '教务处', '图书馆', '一网通办', '校园卡', '宿舍', '食堂', '军训', '快递', '校历', '成绩', '选课', '登录'];
    for (const pattern of importantPatterns) {
      if (keywordStr.includes(pattern)) {
        importantKeywords.push(pattern);
      }
    }
    
    // 合并关键词
    const allKeywords = [...new Set([...keywords, ...importantKeywords])];

    // 使用关键词进行全文搜索（OR 逻辑，任意一个关键词匹配即可）
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
         OR EXISTS (SELECT 1 FROM unnest($2::text[]) kw WHERE q.question ILIKE '%' || kw || '%' OR q.answer ILIKE '%' || kw || '%')
      GROUP BY q.id, c.id, c.name
      ORDER BY q.view_count DESC
      LIMIT $3
    `;

    const searchPattern = `%${keywordStr}%`;
    const items = await query(sql, [searchPattern, allKeywords, Number(pageSize)]);

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
回答要简洁明了，适合学生阅读。

以下是一些固定的官方信息，请优先使用：
- 教务系统网址：http://zhjw.qfnu.edu.cn
- 图书馆网址：https://lib.qfnu.edu.cn
- 一网通办：https://ids.qfnu.edu.cn
- 教务处官网：https://jwc.qfnu.edu.cn
- 校历：https://jwc.qfnu.edu.cn/info/1091/7292.htm
- 智慧曲园APP：用于查成绩、课表等

${items.length > 0 ? '以下是数据库中与用户问题相关的问答，请参考：\n' + context : '数据库中没有直接相关的问答，请根据你的知识回答。'}`;

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
      // AI 调用失败时，如果有数据库结果就提示用户查看，否则返回空
      aiSummary = items.length > 0
        ? '找到了相关的问答，请查看下方卡片了解详情。'
        : null;
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
