import type {
  QAResponse,
  SearchResponse,
  CategoriesResponse,
  TagsResponse,
  QuickLinksResponse,
  QA
} from '@/types';

const API_BASE = '/api';

async function fetchAPI<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // QA 相关
  async getQAList(params: {
    page?: number;
    pageSize?: number;
    category?: number;
    tag?: number;
    sortBy?: string;
    order?: string;
  }): Promise<QAResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return fetchAPI<QAResponse>(`${API_BASE}/qa?${searchParams}`);
  },

  async searchQA(params: {
    keyword: string;
    page?: number;
    pageSize?: number;
    category?: number;
    sortBy?: string;
  }): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return fetchAPI<SearchResponse>(`${API_BASE}/qa/search?${searchParams}`);
  },

  async getQADetail(id: number): Promise<{ success: boolean; data: QA }> {
    return fetchAPI(`${API_BASE}/qa/${id}`);
  },

  // 分类
  async getCategories(): Promise<CategoriesResponse> {
    return fetchAPI<CategoriesResponse>(`${API_BASE}/categories`);
  },

  // 标签
  async getTags(): Promise<TagsResponse> {
    return fetchAPI<TagsResponse>(`${API_BASE}/tags`);
  },

  // 快捷入口
  async getQuickLinks(): Promise<QuickLinksResponse> {
    return fetchAPI<QuickLinksResponse>(`${API_BASE}/quick-links`);
  },

  // 搜索日志
  async logSearch(keyword: string, resultCount: number): Promise<void> {
    await fetch(`${API_BASE}/search-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, resultCount }),
    });
  },

  async getHotSearches(limit: number = 6): Promise<{ success: boolean; data: { keyword: string; count: string }[] }> {
    return fetchAPI(`${API_BASE}/search-logs/hot?limit=${limit}`);
  },

  // AI 相关
  async aiAsk(question: string): Promise<{ success: boolean; data: { answer: string; relatedQA: boolean } }> {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return res.json();
  },

  async aiSearch(keyword: string): Promise<{ success: boolean; data: { items: QA[]; keyword: string; aiSummary: string | null } }> {
    return fetchAPI(`${API_BASE}/ai/search?keyword=${encodeURIComponent(keyword)}`);
  },
};
