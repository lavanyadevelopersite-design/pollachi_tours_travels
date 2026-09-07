import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/queries/useModules';
import { formatRelative } from '../utils/formatters';
import Loader from '../components/common/Loader';

export default function NotificationPanel({ open, anchorEl, onClose }) {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications({ page: 1, perPage: 8 });
  const items = data?.rows || data?.items || data?.data || (Array.isArray(data) ? data : []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ sx: { width: 360, maxHeight: 440 } }}
    >
      <Box px={2} py={1.5} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={600}>
          Notifications
        </Typography>
        <Button
          size="small"
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
        >
          View all
        </Button>
      </Box>
      <Divider />
      {isLoading ? (
        <Loader message="" />
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          No notifications
        </Typography>
      ) : (
        <List dense disablePadding>
          {items.map((item) => (
            <ListItem
              key={item.id}
              sx={{
                bgcolor: item.read ? 'transparent' : 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ListItemText
                primary={item.title || item.message}
                secondary={formatRelative(item.createdAt)}
                primaryTypographyProps={{ variant: 'body2', fontWeight: item.read ? 400 : 600 }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Popover>
  );
}
