export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ZhipuResponse {
  choices?: Array<{ message?: { content?: string } }>
}

export async function callZhipuAI(apiUrl: string, apiKey: string, messages: AIMessage[]): Promise<string> {
  if (!apiUrl) throw new Error('NUXT_ZHIPU_API_URL environment variable is not set')
  if (!apiKey) throw new Error('NUXT_ZHIPU_API_KEY environment variable is not set')

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'glm-4-flash', messages, temperature: 0.7, max_tokens: 512 }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) throw new Error(`AI API request failed with status ${response.status}`)
  const data = await response.json() as ZhipuResponse
  return data.choices?.[0]?.message?.content || '抱歉，曲小问暂时无法回答。'
}
