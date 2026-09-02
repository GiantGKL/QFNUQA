import { defineEventHandler, setResponseHeader } from 'h3'
import { query } from '../utils/db'
import { apiError } from '../utils/response'
import { getDemoCategories, useDemoData } from '../utils/demoData'

export default defineEventHandler(async (event) => {
  try {
    if (useDemoData()) return { success: true, data: getDemoCategories() }
    const categories = await query(`
      SELECT c1.id, c1.name, c1.description, c1.icon, c1.sort_order, c1.parent_id,
        COALESCE(json_agg(json_build_object('id', c2.id, 'name', c2.name, 'sort_order', c2.sort_order)
          ORDER BY c2.sort_order) FILTER (WHERE c2.id IS NOT NULL), '[]') AS children,
        (SELECT COUNT(*) FROM qa_items WHERE category_id = c1.id) AS qa_count
      FROM categories c1
      LEFT JOIN categories c2 ON c2.parent_id = c1.id
      WHERE c1.parent_id IS NULL
      GROUP BY c1.id
      ORDER BY c1.sort_order, c1.id
    `)
    setResponseHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return { success: true, data: categories }
  } catch (error) {
    console.error('Get categories error:', error)
    return apiError(event, 500, '获取分类失败')
  }
})
