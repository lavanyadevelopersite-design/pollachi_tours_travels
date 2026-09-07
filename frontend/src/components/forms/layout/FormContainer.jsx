import { Box, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

export default function FormContainer({
  title,
  onClose,
  children,
  sx,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(60, 72, 88, 0.08)',
        border: '1px solid',
        borderColor: 'divider',
        animation: 'formSlideUp 220ms ease-out',
        ...sx,
      }}
    >
      {title && (
        <Box
          sx={{
            background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%)',
            px: { xs: 2, md: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" fontWeight={600} color="#fff" letterSpacing={0.2}>
            {title}
          </Typography>
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
              aria-label="Close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.paper' }}>{children}</Box>
    </Paper>
  );
}
