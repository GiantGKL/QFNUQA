/**
 * 智谱 AI 调用封装（统一版本，所有路由共用）
 */

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

/**
 * 调用智谱 AI GLM-4-flash 模型
 */
export async function callZhipuAI(messages: ZhipuMessage[]): Promise<string> {
  const apiUrl = process.env.ZHIPU_API_URL;
  const apiKey = process.env.ZHIPU_API_KEY;

  if (!apiUrl) {
    throw new Error('ZHIPU_API_URL 环境变量未设置');
  }
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY 环境变量未设置');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
      const errorText = await response.text();
      throw new Error(`AI API Error: ${response.status} - ${errorText}`);
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

export type { ZhipuMessage };
