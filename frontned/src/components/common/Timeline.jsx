import { Box, Typography } from '@mui/material';
import { formatDateTime } from '../../utils/formatters';

export default function Timeline({ items = [] }) {
  return (
    <Box sx={{ position: 'relative', pl: 3 }}>
      <Box
        sx={{
          position: 'absolute',
          left: 8,
          top: 8,
          bottom: 8,
          width: 2,
          bgcolor: 'divider',
        }}
      />
      {items.map((item, index) => (
        <Box key={item.id || index} sx={{ position: 'relative', pb: 3 }}>
          <Box
            sx={{
              position: 'absolute',
              left: -19,
              top: 4,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: item.color || 'primary.main',
              border: '2px solid #fff',
              boxShadow: 1,
            }}
          />
          <Typography variant="subtitle2" fontWeight={600}>
            {item.title}
          </Typography>
          {item.description && (
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled">
            {formatDateTime(item.date || item.createdAt)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
