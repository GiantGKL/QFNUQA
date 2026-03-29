'use client';

import { useState } from 'react';
import { Container, Box, Typography, Paper, IconButton, InputBase, Fade, CircularProgress, Chip, Divider, Grid, Skeleton, Pagination } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useMutation, useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import QuickLinks from '@/components/QuickLinks';
import QACard from '@/components/QACard';
import QADetailDialog from '@/components/QADetailDialog';

const PAGE_SIZE = 9; // 每页显示 9 条（3列 x 3行）

function CardListSkeleton() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedQAId, setSelectedQAId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 默认 QA 列表（带分页）
  const listQuery = useQuery({
    queryKey: ['qaList', currentPage],
    queryFn: () => api.getQAList({ page: currentPage, pageSize: PAGE_SIZE, sortBy: 'view_count' }),
  });

  // AI 搜索
  const aiSearchMutation = useMutation({
    mutationFn: (keyword: string) => api.aiSearch(keyword),
    onSuccess: (data) => {
      if (data.success) {
        setSearchKeyword(inputValue.trim());
      }
    },
  });

  const handleSearch = () => {
    if (inputValue.trim()) {
      aiSearchMutation.mutate(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSearchKeyword('');
    aiSearchMutation.reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSearching = aiSearchMutation.isPending || !!searchKeyword;
  const searchItems = aiSearchMutation.data?.success ? aiSearchMutation.data.data.items : [];
  const aiSummary = aiSearchMutation.data?.success ? aiSearchMutation.data.data.aiSummary : null;

  // 分页信息
  const totalItems = listQuery.data?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 标题 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            曲阜师范大学智能问答
          </Typography>
          <Typography variant="body1" color="text.secondary">
            输入你的问题，AI 会基于已有知识为你解答
          </Typography>
        </Box>

        {/* 搜索框 */}
        <Paper
          elevation={0}
          sx={{
            p: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: 28,
            bgcolor: 'white',
            maxWidth: 700,
            mx: 'auto',
            mb: 4,
          }}
        >
          <AutoAwesomeIcon sx={{ color: 'primary.main', mr: 1.5 }} />
          <InputBase
            sx={{ flex: 1, fontSize: '1.1rem' }}
            placeholder="输入你的问题..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Fade in={inputValue.length > 0}>
            <IconButton onClick={handleClear} size="small">
              <ClearIcon />
            </IconButton>
          </Fade>
          <IconButton
            onClick={handleSearch}
            disabled={aiSearchMutation.isPending || !inputValue.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'grey.300' },
              ml: 1,
            }}
          >
            {aiSearchMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <SearchIcon />
            )}
          </IconButton>
        </Paper>

        {/* 快捷入口 */}
        <QuickLinks />

        {/* 搜索中加载 */}
        {aiSearchMutation.isPending && <CardListSkeleton />}

        {/* 搜索结果 */}
        {!aiSearchMutation.isPending && isSearching && (
          <Box sx={{ mb: 4 }}>
            {/* AI 回答 */}
            {aiSummary && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.200',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AutoAwesomeIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={600} color="primary.dark">
                    AI 智能回答
                  </Typography>
                </Box>
                <Box
                  sx={{
                    '& p': { mt: 0, mb: 1.5, lineHeight: 1.8 },
                    '& ul, & ol': { mt: 1, mb: 1.5, pl: 2.5 },
                    '& li': { mb: 0.5 },
                    '& strong': { fontWeight: 600 },
                    '& code': {
                      bgcolor: 'action.hover',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontFamily: 'monospace',
                      fontSize: '0.9em',
                    },
                    '& pre': {
                      bgcolor: 'grey.100',
                      p: 1.5,
                      borderRadius: 1,
                      overflow: 'auto',
                    },
                    '& blockquote': {
                      borderLeft: '3px solid',
                      borderColor: 'primary.main',
                      pl: 2,
                      ml: 0,
                      color: 'text.secondary',
                    },
                  }}
                >
                  <ReactMarkdown>{aiSummary}</ReactMarkdown>
                </Box>
              </Paper>
            )}

            {/* 相关卡片 */}
            {searchItems.length > 0 && (
              <>
                <Divider sx={{ mb: 3 }}>
                  <Chip label={`相关问答 (${searchItems.length})`} size="small" />
                </Divider>
                <Grid container spacing={3}>
                  {searchItems.map((qa) => (
                    <Grid item xs={12} sm={6} md={4} key={qa.id}>
                      <QACard qa={qa} onClick={() => setSelectedQAId(qa.id)} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* 无结果 */}
            {searchItems.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">没有找到相关的问答，换个关键词试试？</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* 默认 QA 列表（未搜索时显示） */}
        {!isSearching && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                热门问答
              </Typography>
              {totalItems > 0 && (
                <Typography variant="body2" color="text.secondary">
                  共 {totalItems} 条
                </Typography>
              )}
            </Box>
            {listQuery.isLoading && <CardListSkeleton />}
            {listQuery.data?.success && (
              <>
                <Grid container spacing={3}>
                  {listQuery.data.data.items.map((qa) => (
                    <Grid item xs={12} sm={6} md={4} key={qa.id}>
                      <QACard qa={qa} onClick={() => setSelectedQAId(qa.id)} />
                    </Grid>
                  ))}
                </Grid>
                {/* 分页 */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {/* 详情弹窗 */}
        <QADetailDialog
          open={!!selectedQAId}
          qaId={selectedQAId}
          onClose={() => setSelectedQAId(null)}
        />
      </Container>
    </Box>
  );
}
