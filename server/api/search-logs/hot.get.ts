import { defineEventHandler, getQuery } from 'h3'
import { query } from '../../utils/db'
import { boundedInteger } from '../../utils/params'
import { apiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const limit = boundedInteger(getQuery(event).limit, 10, 1, 20)
    const hotKeywords = await query(`
      SELECT keyword, COUNT(*) AS count
      FROM search_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT $1
    `, [limit])
    return { success: true, data: hotKeywords }
  } catch (error) {
    console.error('Get hot searches error:', error)
    return apiError(event, 500, '获取热门搜索失败')
  }
})
