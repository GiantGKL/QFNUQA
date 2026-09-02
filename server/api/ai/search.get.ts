import { defineEventHandler, getQuery } from 'h3'
import { callZhipuAI, type AIMessage } from '../../utils/ai'
import { query } from '../../utils/db'
import { boundedInteger, cleanKeyword } from '../../utils/params'
import { checkRateLimit, getClientIP } from '../../utils/rateLimit'
import { apiError } from '../../utils/response'

interface RecalledQA {
  id: number
  question: string
  answer: string
  view_count: number
  created_at: string
  updated_at: string
  category_id: number | null
  category_name: string | null
  tags: Array<{ id: number; name: string }>
  relevance: number
}

const SYSTEM_PROMPT = `你是曲阜师范大学的智能问答助手，名叫“曲小问”。你的职责是与学生对话并解答他们的问题。

规则：
1. 如果参考资料中有相关信息，请以此为主，综合整理后给出准确回答。
2. 如果参考资料中没有相关信息，就根据你的知识尽量回答，并在末尾标注“以上信息非官方确认，建议查阅学校官网核实”。
3. 即使是闲聊、打招呼，也要友好回应，并引导用户提问。
4. 回答简洁明了、条理清晰，适合学生阅读。
5. 涉及教务、图书馆、校历等时，优先建议用户查看对应学校官方渠道。`

export default defineEventHandler(async (event) => {
  const clientIP = getClientIP(event)
  if (!checkRateLimit(`ai-search:${clientIP}`, 10, 60_000).allowed) {
    return apiError(event, 429, '请求过于频繁，请稍后再试')
  }

  const request = getQuery(event)
  const keyword = cleanKeyword(request.keyword)
  if (keyword.error) return apiError(event, 400, keyword.error)

  try {
    const pageSize = boundedInteger(request.pageSize, 6, 1, 50)
    const ilikePattern = `%${keyword.value}%`
    const items = await query<RecalledQA>(`
      WITH matched AS (
        SELECT q.id, q.question, q.answer, q.view_count, q.created_at, q.updated_at,
          c.id AS category_id, c.name AS category_name,
          COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name))
            FILTER (WHERE t.id IS NOT NULL), '[]') AS tags,
          CASE
            WHEN q.keyword_vector @@ plainto_tsquery('simple', $1) THEN 3
            WHEN q.question ILIKE $2 OR q.answer ILIKE $2 THEN 2
            ELSE 1
          END AS relevance
        FROM qa_items q
        LEFT JOIN categories c ON q.category_id = c.id
        LEFT JOIN qa_tags qt ON q.id = qt.qa_id
        LEFT JOIN tags t ON qt.tag_id = t.id
        WHERE q.keyword_vector @@ plainto_tsquery('simple', $1)
          OR q.question ILIKE $2 OR q.answer ILIKE $2
          OR EXISTS (SELECT 1 FROM qa_tags qt2 JOIN tags t2 ON qt2.tag_id = t2.id WHERE qt2.qa_id = q.id AND t2.name ILIKE $2)
          OR c.name ILIKE $2
        GROUP BY q.id, c.id, c.name
      )
      SELECT * FROM matched ORDER BY relevance DESC, view_count DESC LIMIT $3
    `, [keyword.value, ilikePattern, pageSize])

    const references = items.slice(0, 5).map((item, index) => `【${index + 1}】问：${item.question}\n答：${item.answer}`).join('\n\n')
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: references ? `参考资料：\n\n${references}\n\n用户问题：${keyword.value}` : keyword.value },
    ]

    let aiSummary: string | null = null
    try {
      const config = useRuntimeConfig(event)
      const apiUrl = process.env.ZHIPU_API_URL || config.zhipuApiUrl
      const apiKey = process.env.ZHIPU_API_KEY || config.zhipuApiKey
      aiSummary = await callZhipuAI(apiUrl, apiKey, messages)
    } catch (error) {
      console.error('AI call failed:', error)
    }

    return { success: true, data: { items, keyword: keyword.value, aiSummary } }
  } catch (error) {
    console.error('AI search error:', error)
    return apiError(event, 500, '搜索失败')
  }
})
