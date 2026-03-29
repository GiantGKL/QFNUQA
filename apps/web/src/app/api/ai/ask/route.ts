import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { callZhipuAI, type ZhipuMessage } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ success: false, error: '请输入问题' }, { status: 400 });
    }

    const searchTerm = `%${question}%`;

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

    return NextResponse.json({
      success: true,
      data: {
        answer: aiAnswer,
        relatedQA: relatedQA.length > 0,
      },
    });
  } catch (error) {
    console.error('AI ask error:', error);
    return NextResponse.json({ success: false, error: 'AI 服务暂时不可用' }, { status: 500 });
  }
}
