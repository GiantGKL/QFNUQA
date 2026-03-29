import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h1" fontSize={80} fontWeight={700} color="primary">
        404
      </Typography>
      <Typography variant="h5">页面不存在</Typography>
      <Link href="/">
        <Button variant="contained">返回首页</Button>
      </Link>
    </Box>
  );
}
