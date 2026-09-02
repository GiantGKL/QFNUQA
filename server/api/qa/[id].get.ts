import { defineEventHandler, getRouterParam } from 'h3'
import { query, queryOne } from '../../utils/db'
import { boundedInteger } from '../../utils/params'
import { apiError } from '../../utils/response'
import { getDemoQA, useDemoData } from '../../utils/demoData'

export default defineEventHandler(async (event) => {
  const id = boundedInteger(getRouterParam(event, 'id'), 0, 0, 1_000_000_000)
  if (!id) return apiError(event, 400, '问答编号无效')

  try {
    if (useDemoData()) {
      const item = getDemoQA(id)
      if (!item) return apiError(event, 404, '未找到该问答')
      return { success: true, data: item }
    }
    await query('UPDATE qa_items SET view_count = view_count + 1 WHERE id = $1', [id])
    const item = await queryOne(`
      SELECT q.id, q.question, q.answer, q.view_count, q.created_at, q.updated_at,
        c.id AS category_id, c.name AS category_name,
        COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name))
          FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
      FROM qa_items q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN qa_tags qt ON q.id = qt.qa_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.id = $1
      GROUP BY q.id, c.id, c.name
    `, [id])
    if (!item) return apiError(event, 404, '未找到该问答')
    return { success: true, data: item }
  } catch (error) {
    console.error('Get QA detail error:', error)
    return apiError(event, 500, '获取详情失败')
  }
})
