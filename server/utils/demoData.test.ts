import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildDemoAnswer, getDemoQAList, searchDemoQAs, useDemoData } from './demoData'

afterEach(() => vi.unstubAllEnvs())

describe('demo data fallback', () => {
  it('activates automatically only in development without a database', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('DATABASE_URL', '')
    vi.stubEnv('DEMO_MODE', '')
    expect(useDemoData()).toBe(true)

    vi.stubEnv('NODE_ENV', 'production')
    expect(useDemoData()).toBe(false)
  })

  it('allows an explicit demo mode override', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DATABASE_URL', 'postgresql://example')
    vi.stubEnv('DEMO_MODE', 'true')
    expect(useDemoData()).toBe(true)
  })

  it('paginates the popular questions', () => {
    const result = getDemoQAList({ page: 1, pageSize: 9, sortBy: 'view_count', order: 'DESC' })
    expect(result.items).toHaveLength(9)
    expect(result.pagination.total).toBe(12)
    expect(result.items[0]?.view_count).toBeGreaterThanOrEqual(result.items[1]?.view_count || 0)
  })

  it('searches questions and builds a usable local answer', () => {
    const items = searchDemoQAs('成绩', 6)
    expect(items[0]?.question).toContain('成绩')
    expect(buildDemoAnswer('成绩', items)).toContain('校园知识库')
  })
})
