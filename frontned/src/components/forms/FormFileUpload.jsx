import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Controller } from 'react-hook-form';

export default function FormFileUpload({ name, control, label = 'Upload file', accept, multiple }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Box>
          <Typography variant="body2" fontWeight={500} mb={1}>
            {label}
          </Typography>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ borderStyle: 'dashed' }}
          >
            Choose file
            <input
              type="file"
              hidden
              accept={accept}
              multiple={multiple}
              onChange={(e) => {
                const files = multiple ? Array.from(e.target.files || []) : e.target.files?.[0];
                onChange(files || null);
              }}
            />
          </Button>
          {value && (
            <Typography variant="caption" display="block" mt={1} color="text.secondary">
              {multiple
                ? `${value.length} file(s) selected`
                : value.name || 'File selected'}
            </Typography>
          )}
          {error && (
            <Typography variant="caption" color="error" display="block" mt={0.5}>
              {error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
}
