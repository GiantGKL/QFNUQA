'use client';

import { useState } from 'react';
import { Box, Grid, Skeleton, Typography, Pagination, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useFilterStore } from '@/store';
import QACard from './QACard';
import QADetailDialog from './QADetailDialog';

function LoadingSkeleton() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
      ))}
    </Grid>
  );
}

function EmptyState() {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h6" color="text.secondary">
        暂无问答数据
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
        请尝试其他搜索条件或筛选
      </Typography>
    </Box>
  );
}

export default function QAList() {
  const { category, tag, sortBy, keyword } = useFilterStore();
  const [selectedQAId, setSelectedQAId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // 搜索或列表查询
  const listQuery = useQuery({
    queryKey: ['qaList', { category, tag, sortBy, page }],
    queryFn: () => api.getQAList({
      page,
      category: category || undefined,
      tag: tag || undefined,
      sortBy: sortBy === 'relevance' ? 'view_count' : sortBy,
    }),
    enabled: !keyword,
  });

  const searchQuery = useQuery({
    queryKey: ['qaSearch', { keyword, category, sortBy, page }],
    queryFn: () => api.searchQA({
      keyword,
      page,
      category: category || undefined,
      sortBy,
    }),
    enabled: !!keyword,
  });

  const isLoading = keyword ? searchQuery.isLoading : listQuery.isLoading;
  const error = keyword ? searchQuery.error : listQuery.error;
  const data = keyword ? searchQuery.data : listQuery.data;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        加载失败，请稍后重试
      </Alert>
    );
  }

  const items = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <Box>
        {/* 结果统计 */}
        {keyword && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            搜索 "{keyword}" 找到 {items.length} 条结果
          </Typography>
        )}

        {/* 卡片列表 */}
        <Grid container spacing={3}>
          {items.map((qa) => (
            <Grid item xs={12} sm={6} md={4} key={qa.id}>
              <QACard
                qa={qa}
                onClick={() => setSelectedQAId(qa.id)}
              />
            </Grid>
          ))}
        </Grid>

        {/* 分页 */}
        {pagination && pagination.total && pagination.total > pagination.pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(pagination.total / pagination.pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>

      {/* 详情弹窗 */}
      <QADetailDialog
        open={!!selectedQAId}
        qaId={selectedQAId}
        onClose={() => setSelectedQAId(null)}
      />
    </>
  );
}
