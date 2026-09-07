import { Button, CircularProgress } from '@mui/material';

export default function PrimaryButton({
  children,
  loading = false,
  loadingText = 'Saving...',
  type = 'button',
  ...rest
}) {
  return (
    <Button
      type={type}
      variant="contained"
      color="primary"
      disabled={loading || rest.disabled}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
      sx={{
        borderRadius: '10px',
        height: 44,
        minWidth: { xs: '100%', sm: 120 },
        px: 3,
        textTransform: 'capitalize',
        fontWeight: 600,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        '&:hover': {
          boxShadow: '0 4px 14px rgba(33,150,243,0.35)',
        },
      }}
      {...rest}
    >
      {loading ? loadingText : children}
    </Button>
  );
}
