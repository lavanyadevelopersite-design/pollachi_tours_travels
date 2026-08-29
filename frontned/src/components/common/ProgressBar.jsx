import { Box, LinearProgress, Typography } from '@mui/material';

export default function ProgressBar({
  value = 0,
  label,
  showValue = true,
  color = 'primary',
  height = 8,
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <Box>
      {(label || showValue) && (
        <Box display="flex" justifyContent="space-between" mb={0.75}>
          {label && (
            <Typography variant="body2" fontWeight={500}>
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography variant="caption" color="text.secondary">
              {clamped}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={clamped}
        color={color}
        sx={{
          height,
          borderRadius: height,
          bgcolor: 'grey.200',
        }}
      />
    </Box>
  );
}
