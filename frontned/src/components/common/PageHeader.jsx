import { Box, Breadcrumbs as MuiBreadcrumbs, Button, Stack, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  actionLabel,
  onAction,
  actionPermission = true,
  extra,
}) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs.length > 0 && (
        <MuiBreadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1.5, '& .MuiBreadcrumbs-li': { fontSize: 13 } }}
        >
          {breadcrumbs.map((crumb, i) =>
            crumb.to && i < breadcrumbs.length - 1 ? (
              <Typography
                key={crumb.label}
                component={RouterLink}
                to={crumb.to}
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Typography key={crumb.label} color="text.primary" fontWeight={500}>
                {crumb.label}
              </Typography>
            )
          )}
        </MuiBreadcrumbs>
      )}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ width: '100%' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary" lineHeight={1.3}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ flexShrink: 0, ml: { sm: 'auto' } }}
        >
          {extra}
          {action}
          {!action && actionLabel && actionPermission && (
            <Button
              variant="contained"
              color="primary"
              onClick={onAction}
              sx={{
                borderRadius: 2.5,
                px: 2.5,
                height: 42,
                minWidth: 'fit-content',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(33,150,243,0.25)',
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
