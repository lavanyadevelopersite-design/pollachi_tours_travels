import { Box, Button, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export default function EmptyState({
  title = 'No data found',
  description = 'There are no records to display yet.',
  actionLabel,
  onAction,
  icon,
}) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ color: 'text.disabled', fontSize: 56, mb: 1 }}>
        {icon || <InboxOutlinedIcon sx={{ fontSize: 56 }} />}
      </Box>
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" maxWidth={360}>
          {description}
        </Typography>
      ) : null}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
