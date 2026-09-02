import { defineEventHandler, readBody } from 'h3'
import { query } from '../../utils/db'
import { cleanKeyword } from '../../utils/params'
import { apiError } from '../../utils/response'
import { logDemoSearch, useDemoData } from '../../utils/demoData'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ keyword?: unknown; resultCount?: unknown }>(event)
    const keyword = cleanKeyword(body?.keyword)
    if (keyword.error) return apiError(event, 400, keyword.error)
    const parsedCount = Number(body?.resultCount)
    const resultCount = Number.isFinite(parsedCount) ? Math.max(Math.trunc(parsedCount), 0) : 0
    if (useDemoData()) {
      logDemoSearch(keyword.value)
      return { success: true }
    }
    await query('INSERT INTO search_logs (keyword, result_count) VALUES ($1, $2)', [keyword.value, resultCount])
    return { success: true }
  } catch (error) {
    console.error('Log search error:', error)
    return apiError(event, 500, '记录失败')
  }
})
