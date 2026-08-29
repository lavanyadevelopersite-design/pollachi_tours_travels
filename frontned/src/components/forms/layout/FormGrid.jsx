import { Grid } from '@mui/material';

export default function FormGrid({ children, spacing = 2.5 }) {
  return (
    <Grid container spacing={spacing}>
      {children}
    </Grid>
  );
}
