'use client';

import { Container, Box, Typography, Divider } from '@mui/material';
import Header from '@/components/Header';
import SearchBox from '@/components/SearchBox';
import AISearchBox from '@/components/AISearchBox';
import QuickLinks from '@/components/QuickLinks';
import FilterBar from '@/components/FilterBar';
import QAList from '@/components/QAList';

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 搜索区域 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            有问题？搜一下！
          </Typography>
          <Typography variant="body1" color="text.secondary">
            快速找到关于曲阜师范大学的答案
          </Typography>
        </Box>

        {/* 普通搜索 */}
        <SearchBox />

        {/* AI 智能搜索 */}
        <Box sx={{ mt: 2, mb: 4 }}>
          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              或者
            </Typography>
          </Divider>
          <AISearchBox />
        </Box>

        {/* 快捷入口 */}
        <QuickLinks />

        {/* 筛选栏 */}
        <FilterBar />

        {/* QA 列表 */}
        <QAList />
      </Container>
    </Box>
  );
}
