'use client';

import { Box, Typography, Button } from '@mui/material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <Typography variant="h4" color="error">
        出错了
      </Typography>
      <Typography color="text.secondary">
        {error.message || '页面加载失败，请重试'}
      </Typography>
      <Button variant="contained" onClick={reset}>
        重试
      </Button>
    </Box>
  );
}
