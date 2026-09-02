import { describe, expect, it } from 'vitest'
import { boundedInteger, cleanKeyword, safeSortField } from './params'

describe('request parameter helpers', () => {
  it('bounds and normalizes integer parameters', () => {
    expect(boundedInteger('200', 10, 1, 50)).toBe(50)
    expect(boundedInteger('invalid', 10, 1, 50)).toBe(10)
  })

  it('validates search keywords', () => {
    expect(cleanKeyword('  校历  ')).toEqual({ value: '校历', error: null })
    expect(cleanKeyword('')).toMatchObject({ error: '请输入搜索关键词' })
  })

  it('allows only whitelisted sort fields', () => {
    expect(safeSortField('updated_at')).toBe('updated_at')
    expect(safeSortField('DROP TABLE')).toBe('view_count')
  })
})
