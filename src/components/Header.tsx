'use client';

import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

export default function Header() {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          曲阜师范大学 QA 问答平台
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
