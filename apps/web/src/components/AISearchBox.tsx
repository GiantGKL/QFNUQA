'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Fade,
  CircularProgress,
  Alert,
  Typography,
  Chip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AISearchBox() {
  const [inputValue, setInputValue] = useState('');
  const [showResult, setShowResult] = useState(false);

  const aiAskMutation = useMutation({
    mutationFn: (question: string) => api.aiAsk(question),
    onSuccess: () => {
      setShowResult(true);
    },
  });

  const handleAsk = () => {
    if (inputValue.trim()) {
      aiAskMutation.mutate(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
    setShowResult(false);
    aiAskMutation.reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAsk();
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* AI 搜索框 */}
      <Paper
        elevation={0}
        sx={{
          p: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          border: '2px solid',
          borderColor: 'secondary.main',
          borderRadius: 28,
          bgcolor: 'white',
          maxWidth: 700,
          mx: 'auto',
        }}
      >
        <AutoAwesomeIcon sx={{ color: 'secondary.main', mr: 1 }} />
        <InputBase
          sx={{ flex: 1, fontSize: '1rem' }}
          placeholder="向 AI 提问，智能解答你的问题..."
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
          onClick={handleAsk}
          disabled={aiAskMutation.isPending || !inputValue.trim()}
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            '&:hover': { bgcolor: 'secondary.dark' },
            '&.Mui-disabled': { bgcolor: 'grey.300' },
            ml: 1,
          }}
        >
          {aiAskMutation.isPending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SearchIcon />
          )}
        </IconButton>
      </Paper>

      {/* AI 回答结果 */}
      <Fade in={showResult && !!aiAskMutation.data}>
        <Box sx={{ mt: 3, maxWidth: 700, mx: 'auto' }}>
          {aiAskMutation.isError && (
            <Alert severity="error">AI 服务暂时不可用，请稍后重试</Alert>
          )}

          {aiAskMutation.data?.success && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AutoAwesomeIcon color="secondary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  AI 智能回答
                </Typography>
                {aiAskMutation.data.data.relatedQA && (
                  <Chip
                    label="参考了相关问答"
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                }}
              >
                {aiAskMutation.data.data.answer}
              </Typography>
            </Paper>
          )}
        </Box>
      </Fade>
    </Box>
  );
}
