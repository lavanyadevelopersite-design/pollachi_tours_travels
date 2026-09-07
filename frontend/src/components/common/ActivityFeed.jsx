import { Avatar, Box, Stack, Typography } from '@mui/material';
import { formatRelative, getInitials } from '../../utils/formatters';

export default function ActivityFeed({ items = [], emptyText = 'No recent activity' }) {
  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary" py={3} textAlign="center">
        {emptyText}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {items.map((item, index) => (
        <Box key={item.id || index} display="flex" gap={1.5} alignItems="flex-start">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {getInitials(item.user || item.title || 'A')}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {item.title || item.action}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {item.description || item.user}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {formatRelative(item.createdAt || item.time)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
