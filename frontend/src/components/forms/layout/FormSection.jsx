import { Box, Divider } from '@mui/material';
import SectionHeading from './SectionHeading';

export default function FormSection({ title, children, sx }) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      {title && (
        <>
          <SectionHeading variant="subtitle1" sx={{ mb: 1.5 }}>
            {title}
          </SectionHeading>
          <Divider sx={{ mb: 3 }} />
        </>
      )}
      {children}
    </Box>
  );
}
