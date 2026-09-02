import { defineEventHandler, setResponseHeader } from 'h3'
import { query } from '../utils/db'
import { apiError } from '../utils/response'
import { demoQuickLinks, useDemoData } from '../utils/demoData'

export default defineEventHandler(async (event) => {
  try {
    if (useDemoData()) return { success: true, data: demoQuickLinks }
    const links = await query(`
      SELECT id, name, icon, url, description, sort_order
      FROM quick_links
      WHERE is_active = true
      ORDER BY sort_order, id
    `)
    setResponseHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return { success: true, data: links }
  } catch (error) {
    console.error('Get quick links error:', error)
    return apiError(event, 500, '获取快捷入口失败')
  }
})
