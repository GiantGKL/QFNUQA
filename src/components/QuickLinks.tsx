'use client';

import { Box, Paper, Typography, Skeleton, Alert } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import LinkIcon from '@mui/icons-material/Link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { QuickLink } from '@/types';

const iconMap: Record<string, React.ReactElement> = {
  map: <MapIcon />,
  calendar: <CalendarMonthIcon />,
  school: <SchoolIcon />,
  link: <LinkIcon />,
};

function getIcon(iconName: string | null): React.ReactElement {
  if (!iconName) return <LinkIcon />;
  return iconMap[iconName] || <LinkIcon />;
}

function QuickLinkCard({ link }: { link: QuickLink }) {
  return (
    <Paper
      component="a"
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'primary.50',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        {getIcon(link.icon)}
      </Box>
      <Typography variant="body2" fontWeight={500} noWrap>
        {link.name}
      </Typography>
    </Paper>
  );
}

function LoadingSkeleton() {
  return (
    <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', py: 1 }}>
      {[1, 2, 3, 4].map((i) => (
        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width={60} />
        </Box>
      ))}
    </Box>
  );
}

export default function QuickLinks() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quickLinks'],
    queryFn: api.getQuickLinks,
  });

  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          快捷入口
        </Typography>
        <LoadingSkeleton />
      </Box>
    );
  }

  if (error || !data?.success || data.data.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        快捷入口
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(4, 1fr)',
            sm: 'repeat(6, 1fr)',
            md: 'repeat(8, 1fr)',
          },
          gap: 2,
        }}
      >
        {data.data.map((link) => (
          <QuickLinkCard key={link.id} link={link} />
        ))}
      </Box>
    </Box>
  );
}
