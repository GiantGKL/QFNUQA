export function boundedInteger(value: unknown, fallback: number, minimum: number, maximum: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.trunc(parsed), minimum), maximum)
}

export function cleanKeyword(value: unknown, maximum = 200): { value: string; error: string | null } {
  const keyword = typeof value === 'string' ? value.trim() : ''
  if (!keyword) return { value: '', error: '请输入搜索关键词' }
  if (keyword.length > maximum) return { value: '', error: `关键词长度不能超过${maximum}字` }
  return { value: keyword, error: null }
}

export function safeSortField(value: unknown): 'view_count' | 'updated_at' | 'created_at' {
  return value === 'updated_at' || value === 'created_at' ? value : 'view_count'
}
