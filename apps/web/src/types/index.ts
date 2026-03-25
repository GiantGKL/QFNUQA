export interface QA {
  id: number;
  question: string;
  answer: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  category_id: number | null;
  category_name: string | null;
  tags: Tag[];
  highlighted_question?: string;
  highlighted_answer?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  parent_id: number | null;
  children: Category[];
  qa_count: string;
}

export interface Tag {
  id: number;
  name: string;
  qa_count?: string;
}

export interface QuickLink {
  id: number;
  name: string;
  icon: string | null;
  url: string;
  description: string | null;
  sort_order: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total?: number;
}

export interface QAResponse {
  success: boolean;
  data: {
    items: QA[];
    pagination: Pagination;
  };
}

export interface SearchResponse {
  success: boolean;
  data: {
    items: QA[];
    keyword: string;
    pagination: Pagination;
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface TagsResponse {
  success: boolean;
  data: Tag[];
}

export interface QuickLinksResponse {
  success: boolean;
  data: QuickLink[];
}
