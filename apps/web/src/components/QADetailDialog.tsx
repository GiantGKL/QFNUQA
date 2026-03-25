'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/Schedule';
import { api } from '@/lib/api';
import type { QA } from '@/types';

interface QADetailDialogProps {
  open: boolean;
  qaId: number | null;
  onClose: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function QADetailDialog({ open, qaId, onClose }: QADetailDialogProps) {
  const [qa, setQA] = useState<QA | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && qaId) {
      setLoading(true);
      api.getQADetail(qaId)
        .then((res) => {
          if (res.success) {
            setQA(res.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, qaId]);

  const handleClose = () => {
    setQA(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: 300 },
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : qa ? (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            <Typography variant="h6" fontWeight={700}>
              {qa.question}
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <Divider />

          <DialogContent>
            {/* 分类和标签 */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {qa.category_name && (
                  <Chip
                    label={qa.category_name}
                    color="primary"
                    size="small"
                  />
                )}
                {qa.tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            {/* 答案 */}
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                color: 'text.primary',
              }}
            >
              {qa.answer}
            </Typography>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Stack direction="row" spacing={3} color="text.secondary">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <VisibilityIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">{qa.view_count} 次浏览</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">更新于 {formatDate(qa.updated_at)}</Typography>
              </Stack>
            </Stack>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}
