import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(process.env.ZHIPU_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages,
        temperature: 0.7,
        max_tokens: 512,
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

// AI 问答接口
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { success: false, error: '请输入问题' },
        { status: 400 }
      );
    }

    const searchTerm = `%${question}%`;

    const searchSql = `
      SELECT question, answer
      FROM qa_items
      WHERE question ILIKE $1 OR answer ILIKE $1
      ORDER BY view_count DESC
      LIMIT 5
    `;
    const relatedQA = await query<{ question: string; answer: string }>(searchSql, [
      searchTerm,
    ]);

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

    const messages: ZhipuMessage[] = [{ role: 'system', content: systemPrompt }];

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

    return NextResponse.json({
      success: true,
      data: {
        answer: aiAnswer,
        relatedQA: relatedQA.length > 0,
      },
    });
  } catch (error) {
    console.error('AI ask error:', error);
    return NextResponse.json(
      { success: false, error: 'AI 服务暂时不可用' },
      { status: 500 }
    );
  }
}
