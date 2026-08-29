import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Stack } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DriverLayout() {
  const { user, logout } = useAuth();
  const name = user?.driver?.full_name || user?.name || 'Driver';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f3f5f8',
        backgroundImage:
          'radial-gradient(circle at top right, rgba(4,169,245,0.12), transparent 40%), linear-gradient(180deg, #eef3f8 0%, #f7f8fa 40%, #f3f5f8 100%)',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(28,35,47,0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          <Avatar
            sx={{
              bgcolor: '#04a9f5',
              width: 36,
              height: 36,
              mr: 1.25,
            }}
          >
            <DirectionsCarFilledOutlinedIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              Driver Trips
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }} noWrap>
              {name}
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={() => logout('/driver/login')} aria-label="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          maxWidth: 720,
          mx: 'auto',
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 2, sm: 3 },
          pb: 6,
        }}
      >
        <Outlet />
      </Box>

      <Stack
        component="footer"
        alignItems="center"
        sx={{ pb: 2, opacity: 0.55, fontSize: 12 }}
      >
        Pollachi Tours and Travels · Driver Portal
      </Stack>
    </Box>
  );
}
