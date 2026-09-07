import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <LockOutlinedIcon sx={{ fontSize: 72, color: 'warning.main' }} />
      <Typography variant="h3" fontWeight={700}>
        403
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Unauthorized
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={360}>
        You don&apos;t have permission to access this page. Contact your administrator if you need access.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Box>
  );
}
