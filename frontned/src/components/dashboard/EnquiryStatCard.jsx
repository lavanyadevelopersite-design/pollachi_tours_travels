import { Box, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PhoneCallbackRoundedIcon from '@mui/icons-material/PhoneCallbackRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

const ICON_MAP = {
  today: TodayRoundedIcon,
  total: InsightsRoundedIcon,
  New: AutoAwesomeRoundedIcon,
  'Proposal Sent': SendRoundedIcon,
  'Follow Up': PhoneCallbackRoundedIcon,
  Confirmed: VerifiedRoundedIcon,
};

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const spark = keyframes`
  0% { transform: scale(1) rotate(-8deg); }
  50% { transform: scale(1.18) rotate(8deg); }
  100% { transform: scale(1) rotate(-8deg); }
`;

const send = keyframes`
  0% { transform: translate(0, 0); }
  50% { transform: translate(3px, -3px); }
  100% { transform: translate(0, 0); }
`;

const ring = keyframes`
  0% { transform: rotate(0deg); }
  20% { transform: rotate(-18deg); }
  40% { transform: rotate(14deg); }
  60% { transform: rotate(-8deg); }
  80% { transform: rotate(6deg); }
  100% { transform: rotate(0deg); }
`;

const pop = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.2); }
  60% { transform: scale(0.94); }
  100% { transform: scale(1); }
`;

const MOTION = {
  today: `${pulse} 2.2s ease-in-out infinite`,
  total: `${spin} 8s linear infinite`,
  New: `${spark} 1.8s ease-in-out infinite`,
  'Proposal Sent': `${send} 1.6s ease-in-out infinite`,
  'Follow Up': `${ring} 1.8s ease-in-out infinite`,
  Confirmed: `${pop} 2s ease-in-out infinite`,
};

export default function EnquiryStatCard({
  title,
  value,
  iconColor = '#64748b',
  iconKey,
  viewAllTo,
  loading,
}) {
  const Icon = ICON_MAP[iconKey] || ICON_MAP[title] || InsightsRoundedIcon;
  const animation = MOTION[iconKey] || MOTION[title] || MOTION.today;
  const clickable = Boolean(viewAllTo);

  return (
    <Box
      {...(clickable ? { component: RouterLink, to: viewAllTo } : { component: 'div' })}
      sx={{
        height: '100%',
        minHeight: 108,
        borderRadius: 3,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        background: `linear-gradient(160deg, #fff 0%, ${alpha(iconColor, 0.22)} 72%, ${alpha(iconColor, 0.38)} 100%)`,
        border: `1px solid ${alpha(iconColor, 0.32)}`,
        boxShadow: `0 10px 22px ${alpha(iconColor, 0.16)}`,
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 28px ${alpha(iconColor, 0.24)}`,
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          right: -18,
          top: -22,
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: alpha(iconColor, 0.16),
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          right: 18,
          bottom: -28,
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: alpha(iconColor, 0.1),
        }}
      />

      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          bgcolor: iconColor,
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          mb: 1.1,
          position: 'relative',
          boxShadow: `0 8px 16px ${alpha(iconColor, 0.42)}`,
        }}
      >
        <Box sx={{ display: 'grid', placeItems: 'center', animation }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
      </Box>

      <Typography
        fontSize={12}
        fontWeight={700}
        color={iconColor}
        noWrap
        lineHeight={1.2}
        position="relative"
      >
        {title}
      </Typography>
      <Typography
        fontSize={26}
        fontWeight={800}
        color="#0f172a"
        lineHeight={1.15}
        mt={0.35}
        position="relative"
      >
        {loading ? '—' : value ?? 0}
      </Typography>
    </Box>
  );
}
