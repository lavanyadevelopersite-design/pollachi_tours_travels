import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Breadcrumbs from './Breadcrumbs';
import MobileDrawer from './MobileDrawer';
import { useUiStore } from '../store/uiStore';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { useEffect } from 'react';

export default function MainLayout() {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const isEnquiryView = location.pathname.startsWith('/enquiry/view/');

  useSessionTimeout();

  useEffect(() => {
    if (isMobile) return;
    if (isTablet || isEnquiryView) setSidebarCollapsed(true);
    else setSidebarCollapsed(false);
  }, [isTablet, isMobile, isEnquiryView, setSidebarCollapsed]);

  const sidebarWidth = sidebarCollapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-width)';

  return (
    <Box
      className="print-root"
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        '@media print': {
          display: 'block',
          minHeight: 0,
          bgcolor: '#fff',
        },
      }}
    >
      {!isMobile && (
        <Box
          component="nav"
          className="no-print"
          data-print-hide="true"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: theme.zIndex.drawer,
            transition: 'width 0.25s ease',
          }}
        >
          <Sidebar />
        </Box>
      )}

      <Box className="no-print" data-print-hide="true">
        <MobileDrawer />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarWidth})` },
          ml: { md: sidebarWidth },
          transition: 'margin 0.25s ease, width 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          height: { xs: '100dvh', md: '100vh' },
          overflow: 'hidden',
          '@media print': {
            width: '100% !important',
            ml: '0 !important',
            height: 'auto',
            overflow: 'visible',
            minHeight: 0,
            display: 'block',
          },
        }}
      >
        <Box className="no-print" data-print-hide="true" sx={{ flexShrink: 0, zIndex: theme.zIndex.appBar }}>
          <TopNavbar />
        </Box>
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
            '@media print': {
              p: '0 !important',
              m: 0,
              overflow: 'visible',
            },
          }}
        >
          <Box className="no-print" data-print-hide="true">
            <Breadcrumbs />
          </Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
