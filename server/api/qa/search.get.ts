import { defineEventHandler, getQuery } from 'h3'
import { query, queryOne } from '../../utils/db'
import { boundedInteger, cleanKeyword } from '../../utils/params'
import { apiError } from '../../utils/response'
import { searchDemoQAs, useDemoData } from '../../utils/demoData'

export default defineEventHandler(async (event) => {
  const request = getQuery(event)
  const keyword = cleanKeyword(request.keyword)
  if (keyword.error) return apiError(event, 400, keyword.error)

  try {
    const page = boundedInteger(request.page, 1, 1, 1_000_000)
    const pageSize = boundedInteger(request.pageSize, 10, 1, 50)
    const category = boundedInteger(request.category, 0, 0, 1_000_000)
    const offset = (page - 1) * pageSize
    if (useDemoData()) {
      const allItems = searchDemoQAs(keyword.value, 50, category)
      return { success: true, data: { items: allItems.slice(offset, offset + pageSize), keyword: keyword.value, pagination: { page, pageSize, total: allItems.length } } }
    }
    const orderBy = request.sortBy === 'updated_at'
      ? 'q.updated_at DESC'
      : request.sortBy === 'view_count'
        ? 'q.view_count DESC'
        : `ts_rank(q.keyword_vector, plainto_tsquery('simple', $1)) DESC`

    let sql = `
      SELECT q.id, q.question, q.answer, q.view_count, q.created_at, q.updated_at,
        c.id AS category_id, c.name AS category_name,
        ts_headline('simple', q.question, plainto_tsquery('simple', $1), 'MaxWords=35,MinWords=15') AS highlighted_question,
        ts_headline('simple', q.answer, plainto_tsquery('simple', $1), 'MaxWords=50,MinWords=15') AS highlighted_answer,
        COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name))
          FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
      FROM qa_items q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN qa_tags qt ON q.id = qt.qa_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.keyword_vector @@ plainto_tsquery('simple', $1)`
    const params: unknown[] = [keyword.value]
    if (category) {
      sql += ' AND q.category_id = $2'
      params.push(category)
    }
    const limitIndex = params.length + 1
    sql += ` GROUP BY q.id, c.id, c.name ORDER BY ${orderBy} LIMIT $${limitIndex} OFFSET $${limitIndex + 1}`
    params.push(pageSize, offset)

    let countSql = `SELECT COUNT(DISTINCT q.id) AS total FROM qa_items q WHERE q.keyword_vector @@ plainto_tsquery('simple', $1)`
    const countParams: unknown[] = [keyword.value]
    if (category) {
      countSql += ' AND q.category_id = $2'
      countParams.push(category)
    }

    const [items, count] = await Promise.all([
      query(sql, params),
      queryOne<{ total: string }>(countSql, countParams),
    ])
    return { success: true, data: { items, keyword: keyword.value, pagination: { page, pageSize, total: Number(count?.total || 0) } } }
  } catch (error) {
    console.error('Search QA error:', error)
    return apiError(event, 500, '搜索失败')
  }
})
