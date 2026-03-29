'use client';

import { Card, CardContent, CardActionArea, Typography, Box, Chip, Stack } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { QA } from '@/types';

interface QACardProps {
  qa: QA;
  onClick?: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function QACard({ qa, onClick }: QACardProps) {
  const question = qa.highlighted_question
    ? stripHtml(qa.highlighted_question)
    : qa.question;
  const answer = qa.highlighted_answer
    ? stripHtml(qa.highlighted_answer)
    : qa.answer;

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 分类 */}
          {qa.category_name && (
            <Chip
              label={qa.category_name}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ alignSelf: 'flex-start', mb: 1 }}
            />
          )}

          {/* 问题 */}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {question}
          </Typography>

          {/* 答案摘要 */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {answer}
          </Typography>

          {/* 底部信息 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1}>
              {qa.tags.slice(0, 2).map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={2} color="text.disabled">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <VisibilityIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{qa.view_count}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{formatDate(qa.updated_at)}</Typography>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
