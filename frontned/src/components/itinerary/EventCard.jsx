import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LocalActivityOutlinedIcon from '@mui/icons-material/LocalActivityOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import SailingOutlinedIcon from '@mui/icons-material/SailingOutlined';
import { resolveMediaUrl } from '../../utils/constants';
import { EVENT_TYPE_OPTIONS, getEventTypeConfig } from '../../schemas/itinerary.schema';
import { toAmPmTime } from '../../utils/timeFormat';

const ICONS = {
  accommodation: HotelOutlinedIcon,
  activity: LocalActivityOutlinedIcon,
  transportation: DirectionsCarOutlinedIcon,
  visa: BadgeOutlinedIcon,
  meal: RestaurantOutlinedIcon,
  flight: FlightTakeoffOutlinedIcon,
  leisure: SpaOutlinedIcon,
  cruise: SailingOutlinedIcon,
};

export function getEventTypeMeta(type) {
  const opt = EVENT_TYPE_OPTIONS.find((o) => o.value === type);
  return {
    label: opt?.label || type,
    Icon: ICONS[type] || LocalActivityOutlinedIcon,
  };
}

export default function EventCard({
  event,
  onEdit,
  onDelete,
  draggable = true,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const { label, Icon } = getEventTypeMeta(event.event_type);
  const image = resolveMediaUrl(event.image_url);
  const typeConfig = getEventTypeConfig(event.event_type);
  const detailEntries = (typeConfig.fields || [])
    .map((f) => ({
      label: f.label,
      value: event.details?.[f.name],
      hideOnCard: f.hideOnCard,
    }))
    .filter((d) => d.value && !d.hideOnCard);

  return (
    <Card
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(21,34,56,0.08)',
        border: '1px solid rgba(226,232,240,0.9)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        cursor: draggable ? 'grab' : 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 14px 36px rgba(21,34,56,0.12)',
        },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }}>
        <Box
          sx={{
            width: { xs: '100%', sm: 140 },
            minHeight: { xs: 120, sm: 'auto' },
            bgcolor: 'rgba(33,150,243,0.08)',
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {!image && <Icon sx={{ fontSize: 42, color: 'primary.main', opacity: 0.7 }} />}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(255,255,255,0.9)',
              borderRadius: 1.5,
              px: 0.5,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <DragIndicatorIcon fontSize="small" color="action" />
          </Box>
        </Box>
        <CardContent sx={{ flex: 1, py: 1.75, '&:last-child': { pb: 1.75 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  icon={<Icon sx={{ fontSize: '16px !important' }} />}
                  label={label}
                  sx={{ fontWeight: 600, bgcolor: 'rgba(33,150,243,0.1)' }}
                />
                {event.event_time && (
                  <Typography variant="caption" fontWeight={700} color="primary.main">
                    {toAmPmTime(event.event_time)}
                  </Typography>
                )}
              </Stack>
              <Typography variant="subtitle1" fontWeight={700}>
                {event.name}
              </Typography>
              {detailEntries.length > 0 && (
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mt: 0.75 }}>
                  {detailEntries.slice(0, 4).map((d) => (
                    <Chip
                      key={d.label}
                      size="small"
                      label={`${d.label}: ${d.value}`}
                      sx={{
                        height: 24,
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(21,34,56,0.05)',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              )}
              {event.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {event.description}
                </Typography>
              )}
            </Box>
            <Stack direction="row">
              <Tooltip title="Edit"><IconButton size="small" color="warning" onClick={() => onEdit?.(event)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete?.(event)}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Stack>
    </Card>
  );
}
