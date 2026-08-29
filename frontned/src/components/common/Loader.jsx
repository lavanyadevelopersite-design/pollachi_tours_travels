import { Box, CircularProgress, Typography } from '@mui/material';

export default function Loader({ message = 'Loading...', fullScreen = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: fullScreen ? '100vh' : 240,
        width: '100%',
      }}
    >
      <CircularProgress size={40} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
