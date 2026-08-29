import { Drawer } from '@mui/material';
import Sidebar from './Sidebar';
import { useUiStore } from '../store/uiStore';

export default function MobileDrawer() {
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();

  return (
    <Drawer
      variant="temporary"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          width: 'var(--sidebar-width)',
          boxSizing: 'border-box',
        },
      }}
    >
      <Sidebar collapsed={false} />
    </Drawer>
  );
}
