import { create } from 'zustand';

interface FilterState {
  category: number | null;
  tag: number | null;
  sortBy: 'view_count' | 'updated_at' | 'relevance';
  keyword: string;
  setCategory: (category: number | null) => void;
  setTag: (tag: number | null) => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  setKeyword: (keyword: string) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  category: null,
  tag: null,
  sortBy: 'view_count',
  keyword: '',
  setCategory: (category) => set({ category, tag: null }),
  setTag: (tag) => set({ tag }),
  setSortBy: (sortBy) => set({ sortBy }),
  setKeyword: (keyword) => set({ keyword }),
  reset: () => set({ category: null, tag: null, sortBy: 'view_count', keyword: '' }),
}));
