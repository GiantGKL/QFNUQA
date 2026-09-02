import { defineEventHandler, setResponseHeader } from 'h3'
import { query } from '../utils/db'
import { apiError } from '../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const tags = await query(`
      SELECT t.id, t.name, (SELECT COUNT(*) FROM qa_tags WHERE tag_id = t.id) AS qa_count
      FROM tags t
      ORDER BY qa_count DESC, t.name
    `)
    setResponseHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return { success: true, data: tags }
  } catch (error) {
    console.error('Get tags error:', error)
    return apiError(event, 500, '获取标签失败')
  }
})
