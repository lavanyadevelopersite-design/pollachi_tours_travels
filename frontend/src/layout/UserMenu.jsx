import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/formatters';

export default function UserMenu() {
  const [anchor, setAnchor] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName =
    user?.name ||
    [user?.first_name || user?.firstName, user?.last_name || user?.lastName].filter(Boolean).join(' ') ||
    'Admin User';
  const role = user?.role?.name || user?.roleName || user?.role || 'Super Admin';
  const email = user?.email || 'admin@travelgo.com';

  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          ml: 0.5,
          px: 1.25,
          py: 0.75,
          borderRadius: 2.5,
          cursor: 'pointer',
          border: '1px solid',
          borderColor: anchor ? 'primary.light' : 'transparent',
          bgcolor: anchor ? 'rgba(33,150,243,0.06)' : 'transparent',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          '&:hover': { bgcolor: 'rgba(21,34,56,0.04)' },
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: 'primary.main',
            fontSize: 14,
            fontWeight: 600,
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(33,150,243,0.25)',
          }}
          src={user?.avatar || user?.photo}
        >
          {getInitials(displayName)}
        </Avatar>
        <Box sx={{ display: { xs: 'none', md: 'block' }, lineHeight: 1.2, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {role}
          </Typography>
        </Box>
        <KeyboardArrowDownIcon
          sx={{
            display: { xs: 'none', md: 'block' },
            fontSize: 18,
            color: 'text.secondary',
            transform: anchor ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </Box>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 260,
              mt: 1.5,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              boxShadow: '0 12px 40px rgba(21,34,56,0.12)',
            },
          },
          list: {
            sx: { py: 1 },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'rgba(33,150,243,0.06)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: 'primary.main',
              fontSize: 15,
              fontWeight: 600,
            }}
            src={user?.avatar || user?.photo}
          >
            {getInitials(displayName)}
          </Avatar>
          <Box minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {email}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'inline-block',
                mt: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: 'rgba(33,150,243,0.12)',
                color: 'primary.main',
                fontWeight: 600,
              }}
            >
              {role}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ py: 0.5 }}>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              navigate('/settings');
            }}
            sx={{ mx: 1, borderRadius: 2, py: 1.1 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PersonOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Box sx={{ pb: 0.5 }}>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              logout();
            }}
            sx={{
              mx: 1,
              borderRadius: 2,
              py: 1.1,
              color: 'error.main',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
}
