import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

export function ownershipType(record) {
  if (!record) return 'own';
  const raw =
    record.ownership ||
    record.driver_type ||
    record.driverType ||
    record.vehicle_ownership ||
    record.vehicleOwnership;
  return String(raw || '').toLowerCase() === 'vendor' ? 'vendor' : 'own';
}

/** Small Own / Vendor pill shown under vehicle and driver names. */
export default function OwnershipTag({ type, record, sx }) {
  const kind = type || ownershipType(record);
  const isVendor = kind === 'vendor';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 18,
        px: 0.85,
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 0.2,
        lineHeight: 1,
        bgcolor: isVendor ? alpha('#d97706', 0.14) : alpha('#0f766e', 0.12),
        color: isVendor ? '#b45309' : '#0f766e',
        border: '1px solid',
        borderColor: isVendor ? alpha('#d97706', 0.28) : alpha('#0f766e', 0.22),
        ...sx,
      }}
    >
      {isVendor ? 'Vendor' : 'Own'}
    </Box>
  );
}
