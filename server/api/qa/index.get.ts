import { defineEventHandler, getQuery } from 'h3'
import { query, queryOne } from '../../utils/db'
import { boundedInteger, safeSortField } from '../../utils/params'
import { apiError } from '../../utils/response'
import { getDemoQAList, useDemoData } from '../../utils/demoData'

export default defineEventHandler(async (event) => {
  try {
    const request = getQuery(event)
    const page = boundedInteger(request.page, 1, 1, 1_000_000)
    const pageSize = boundedInteger(request.pageSize, 10, 1, 50)
    const category = boundedInteger(request.category, 0, 0, 1_000_000)
    const tag = boundedInteger(request.tag, 0, 0, 1_000_000)
    const sortField = safeSortField(request.sortBy)
    const sortOrder = request.order === 'ASC' ? 'ASC' : 'DESC'
    const offset = (page - 1) * pageSize

    if (useDemoData()) {
      return { success: true, data: getDemoQAList({ page, pageSize, category, tag, sortBy: sortField, order: sortOrder }) }
    }

    let sql = `
      SELECT q.id, q.question, q.answer, q.view_count, q.created_at, q.updated_at,
        c.id AS category_id, c.name AS category_name,
        COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name))
          FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
      FROM qa_items q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN qa_tags qt ON q.id = qt.qa_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE 1=1`
    const params: unknown[] = []
    let index = 1

    if (category) {
      sql += ` AND q.category_id = $${index++}`
      params.push(category)
    }
    if (tag) {
      sql += ` AND EXISTS (SELECT 1 FROM qa_tags filter_tags WHERE filter_tags.qa_id = q.id AND filter_tags.tag_id = $${index++})`
      params.push(tag)
    }
    sql += ` GROUP BY q.id, c.id, c.name ORDER BY q.${sortField} ${sortOrder} LIMIT $${index++} OFFSET $${index}`
    params.push(pageSize, offset)

    let countSql = 'SELECT COUNT(DISTINCT q.id) AS total FROM qa_items q WHERE 1=1'
    const countParams: unknown[] = []
    let countIndex = 1
    if (category) {
      countSql += ` AND q.category_id = $${countIndex++}`
      countParams.push(category)
    }
    if (tag) {
      countSql += ` AND EXISTS (SELECT 1 FROM qa_tags filter_tags WHERE filter_tags.qa_id = q.id AND filter_tags.tag_id = $${countIndex})`
      countParams.push(tag)
    }

    const [items, count] = await Promise.all([
      query(sql, params),
      queryOne<{ total: string }>(countSql, countParams),
    ])

    return { success: true, data: { items, pagination: { page, pageSize, total: Number(count?.total || 0) } } }
  } catch (error) {
    console.error('Get QA list error:', error)
    return apiError(event, 500, '获取列表失败')
  }
})
