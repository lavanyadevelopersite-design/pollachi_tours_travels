import { Chip } from '@mui/material';
import { STATUS_COLORS } from '../../utils/constants';

export default function StatusBadge({ status, label, size = 'small' }) {
  const color = STATUS_COLORS[status] || 'default';
  const display = label || String(status || '').replace(/_/g, ' ');

  return (
    <Chip
      label={display}
      color={color}
      size={size}
      sx={{
        textTransform: 'capitalize',
        fontWeight: 500,
        height: size === 'small' ? 24 : 28,
      }}
    />
  );
}
