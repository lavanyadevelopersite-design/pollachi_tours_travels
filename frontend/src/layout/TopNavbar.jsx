import { AppBar, Stack, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import IconButton from '@mui/material/IconButton';
import { useUiStore } from '../store/uiStore';
import UserMenu from './UserMenu';
import NavActionIcon from './NavActionIcon';
import { useNavigate } from 'react-router-dom';

export default function TopNavbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { sidebarCollapsed, toggleSidebar, toggleMobileDrawer } = useUiStore();

  const handleMenuClick = () => {
    if (isMobile) toggleMobileDrawer();
    else toggleSidebar();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: '100%',
        bgcolor: '#fff',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          width: '100%',
          minHeight: 'var(--topbar-height) !important',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          px: { xs: 2, md: 3 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
          <IconButton edge="start" onClick={handleMenuClick} sx={{ flexShrink: 0 }}>
            {isMobile || sidebarCollapsed || isTablet ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={{ xs: 0.25, sm: 0.5 }} sx={{ flexShrink: 0 }}>
          <NavActionIcon
            title="WhatsApp Inbox"
            onClick={() => navigate('/whatsapp-inbox')}
            color="#25D366"
            hoverBg="rgba(37,211,102,0.14)"
          >
            <WhatsAppIcon />
          </NavActionIcon>
          <NavActionIcon
            title="WhatsApp Template Structure"
            onClick={() => navigate('/whatsapp-templates')}
            color="#128C7E"
            hoverBg="rgba(18,140,126,0.12)"
          >
            <ViewListOutlinedIcon />
          </NavActionIcon>
          <NavActionIcon
            title="Mail Integration"
            onClick={() => navigate('/integrations/mail')}
            color="#1976d2"
            hoverBg="rgba(25,118,210,0.12)"
          >
            <EmailOutlinedIcon />
          </NavActionIcon>
          <NavActionIcon
            title="Calendar"
            onClick={() => navigate('/calendar')}
            color="#7b1fa2"
            hoverBg="rgba(123,31,162,0.12)"
          >
            <CalendarMonthOutlinedIcon />
          </NavActionIcon>
          <UserMenu />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
