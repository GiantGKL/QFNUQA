'use client';

import { Box, FormControl, InputLabel, Select, MenuItem, ToggleButton, ToggleButtonGroup, Chip, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useFilterStore } from '@/store';

export default function FilterBar() {
  const { category, tag, sortBy, setCategory, setTag, setSortBy, keyword } = useFilterStore();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: api.getTags,
  });

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* 分类筛选 */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>分类</InputLabel>
          <Select
            value={category || ''}
            label="分类"
            onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : null)}
          >
            <MenuItem value="">全部分类</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name} ({cat.qa_count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 标签筛选 */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>标签</InputLabel>
          <Select
            value={tag || ''}
            label="标签"
            onChange={(e) => setTag(e.target.value ? Number(e.target.value) : null)}
          >
            <MenuItem value="">全部标签</MenuItem>
            {tags.slice(0, 20).map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name} ({t.qa_count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 排序方式 */}
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            排序:
          </Typography>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={(_, value) => value && setSortBy(value)}
            size="small"
          >
            <ToggleButton value="view_count">浏览量</ToggleButton>
            <ToggleButton value="updated_at">更新时间</ToggleButton>
            {keyword && <ToggleButton value="relevance">相关性</ToggleButton>}
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* 已选筛选条件 */}
      {(category || tag) && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            已选:
          </Typography>
          {category && (
            <Chip
              label={categories.find((c) => c.id === category)?.name}
              size="small"
              onDelete={() => setCategory(null)}
            />
          )}
          {tag && (
            <Chip
              label={tags.find((t) => t.id === tag)?.name}
              size="small"
              onDelete={() => setTag(null)}
            />
          )}
        </Stack>
      )}
    </Box>
  );
}
