import { Box } from '@mui/material';
import { DASHBOARD_SIDE_BACKGROUND } from '../../utils/dashboardData';
import { publicAssetUrl } from '../../utils/constants';

export default function DashboardSideBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: { md: '46%', lg: '42%', xl: '40%' },
        maxWidth: 500,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Box
        component="img"
        src={publicAssetUrl(DASHBOARD_SIDE_BACKGROUND)}
        alt=""
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'bottom right',
          opacity: 0.9,
          filter: 'saturate(1.08)',
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 62%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 62%, transparent 100%)',
        }}
      />
    </Box>
  );
}
