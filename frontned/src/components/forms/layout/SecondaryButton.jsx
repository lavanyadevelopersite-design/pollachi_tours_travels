import { Button } from '@mui/material';

export default function SecondaryButton({ children, ...rest }) {
  return (
    <Button
      variant="outlined"
      color="inherit"
      sx={{
        borderRadius: '10px',
        height: 44,
        minWidth: { xs: '100%', sm: 120 },
        px: 3,
        textTransform: 'none',
        fontWeight: 500,
        borderColor: 'divider',
        borderWidth: 1.5,
        color: 'text.secondary',
        '&:hover': {
          borderWidth: 1.5,
          borderColor: 'text.secondary',
          bgcolor: 'rgba(21,34,56,0.04)',
        },
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}
