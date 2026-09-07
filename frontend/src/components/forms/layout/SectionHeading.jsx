import { Typography } from '@mui/material';

/**
 * Shared form / card section title with consistent spacing below the heading.
 */
export default function SectionHeading({ children, variant = 'h6', sx }) {
  return (
    <Typography
      variant={variant}
      fontWeight={600}
      color="text.primary"
      sx={{ mb: 3, ...sx }}
    >
      {children}
    </Typography>
  );
}
