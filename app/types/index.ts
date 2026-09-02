export interface Tag {
  id: number
  name: string
  qa_count?: string
}

export interface QA {
  id: number
  question: string
  answer: string
  view_count: number
  created_at: string
  updated_at: string
  category_id: number | null
  category_name: string | null
  tags: Tag[]
  highlighted_question?: string
  highlighted_answer?: string
}

export interface QuickLink {
  id: number
  name: string
  icon: string | null
  url: string
  description: string | null
  sort_order: number
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
}

export interface ApiResult<T> {
  success: boolean
  data: T
  error?: string
}

export type QAListResult = ApiResult<{ items: QA[]; pagination: Pagination }>
export type QuickLinksResult = ApiResult<QuickLink[]>
export type HotSearchResult = ApiResult<Array<{ keyword: string; count: string }>>
export type AISearchResult = ApiResult<{ items: QA[]; keyword: string; aiSummary: string | null }>
