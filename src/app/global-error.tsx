'use client';

import { Box, Typography, Button } from '@mui/material';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            bgcolor: 'grey.100',
          }}
        >
          <Typography variant="h4" color="error">
            发生错误
          </Typography>
          <Typography color="text.secondary">
            {error.message || '应用程序遇到问题'}
          </Typography>
          <Button variant="contained" onClick={reset}>
            重试
          </Button>
        </Box>
      </body>
    </html>
  );
}
