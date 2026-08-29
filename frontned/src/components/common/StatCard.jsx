import { Box, Card, CardContent, Typography, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { dashboardGlassCardSx, dashboardGlassCardLightSx } from '../../utils/dashboardData';

export default function StatCard({
  title,
  value,
  icon,
  color = '#2196f3',
  bgColor,
  trend,
  trendLabel = 'vs last month',
  loading,
  transparent = false,
  light = false,
}) {
  const isPositive = trend === undefined || trend >= 0;
  const iconBg = bgColor || alpha(color, 0.12);
  const glassSx = light ? dashboardGlassCardLightSx : dashboardGlassCardSx;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...(transparent
          ? {
              ...glassSx,
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 24px rgba(21,34,56,0.08)',
              },
            }
          : {
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 32px rgba(21,34,56,0.1)',
              },
            }),
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
              {loading ? '—' : value}
            </Typography>
            {trend !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1.5} flexWrap="wrap">
                {isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color={isPositive ? 'success.main' : 'error.main'}
                >
                  {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {trendLabel}
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: iconBg,
                color,
                flexShrink: 0,
                '& svg': { fontSize: 26 },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
