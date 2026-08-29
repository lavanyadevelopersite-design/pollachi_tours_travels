import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export default function NotFound() {
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
      <SearchOffIcon sx={{ fontSize: 72, color: 'text.disabled' }} />
      <Typography variant="h3" fontWeight={700}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={360}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Box>
  );
}
