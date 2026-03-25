'use client';

import { useState } from 'react';
import { Box, Paper, InputBase, IconButton, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useFilterStore } from '@/store';

export default function SearchBox() {
  const { keyword, setKeyword } = useFilterStore();
  const [inputValue, setInputValue] = useState(keyword);

  const handleSearch = () => {
    setKeyword(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue('');
    setKeyword('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 28,
          bgcolor: 'white',
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: '1.1rem' }}
          placeholder="搜索问题..."
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
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            ml: 1,
          }}
        >
          <SearchIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
