import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

function DayNavList({ days, selectedDayId, onSelect, onClose }) {
  return (
    <List sx={{ py: 1 }}>
      {(days || []).map((day) => {
        const selected = day.id === selectedDayId;
        return (
          <ListItemButton
            key={day.id}
            selected={selected}
            onClick={() => {
              onSelect?.(day);
              onClose?.();
            }}
            sx={{
              mx: 1,
              mb: 0.75,
              borderRadius: 2,
              alignItems: 'flex-start',
              border: '1px solid',
              borderColor: selected ? 'primary.main' : 'transparent',
              bgcolor: selected ? 'rgba(33,150,243,0.1)' : 'transparent',
              transition: 'all 180ms ease',
              '&:hover': { bgcolor: 'rgba(33,150,243,0.08)' },
            }}
          >
            <ListItemText
              primary={
                <Typography variant="subtitle2" fontWeight={800} color={selected ? 'primary.main' : 'text.primary'}>
                  DAY {day.day_number}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {day.date ? dayjs(day.date).format('DD MMM YYYY') : '—'}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                    {day.destination || day.subject || 'Destination TBD'}
                  </Typography>
                </>
              }
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

/**
 * Sticky day navigation sidebar (collapsible drawer on mobile).
 */
export default function DaySidebar({
  days = [],
  selectedDayId,
  onSelect,
  mobileOpen,
  onMobileOpen,
  onMobileClose,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const panel = (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(14px)',
        borderRight: { md: '1px solid' },
        borderColor: { md: 'divider' },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" fontWeight={800}>
          Day Navigation
        </Typography>
        {isMobile && (
          <IconButton size="small" onClick={onMobileClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      <DayNavList
        days={days}
        selectedDayId={selectedDayId}
        onSelect={onSelect}
        onClose={isMobile ? onMobileClose : undefined}
      />
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={onMobileOpen}
          sx={{
            position: 'sticky',
            top: 8,
            zIndex: 5,
            mb: 1.5,
            bgcolor: '#fff',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 1,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer open={!!mobileOpen} onClose={onMobileClose} PaperProps={{ sx: { width: 280 } }}>
          {panel}
        </Drawer>
      </>
    );
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 16,
        maxHeight: 'calc(100vh - 32px)',
        overflow: 'auto',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 28px rgba(21,34,56,0.06)',
      }}
    >
      {panel}
    </Box>
  );
}
