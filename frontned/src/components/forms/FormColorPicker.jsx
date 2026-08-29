import { Box, InputLabel, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function FormColorPicker({ name, control, label, disabled }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <InputLabel shrink sx={{ mb: 1, fontSize: 14, color: error ? 'error.main' : 'text.secondary' }}>
            {label}
          </InputLabel>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box
              component="input"
              type="color"
              value={field.value || '#007BFF'}
              disabled={disabled}
              onChange={(event) => field.onChange(event.target.value.toUpperCase())}
              sx={{
                width: 52,
                height: 52,
                p: 0.5,
                border: '1px solid',
                borderColor: error ? 'error.main' : 'divider',
                borderRadius: 1.5,
                cursor: disabled ? 'not-allowed' : 'pointer',
                bgcolor: 'background.paper',
              }}
            />
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: field.value || '#007BFF',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
              }}
            />
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {field.value || '#007BFF'}
            </Typography>
          </Box>
          {error?.message && (
            <Typography variant="caption" color="error" display="block" mt={0.75}>
              {error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
}
