import { Box, Card, CardContent, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DonutLargeRoundedIcon from '@mui/icons-material/DonutLargeRounded';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { normalizeBookingStatus } from '../../utils/dashboardData';

const FALLBACK_COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#22c55e', '#ec4899', '#8b5cf6', '#f97316'];
const ACCENT = '#f97316';
const SIZE = 168;

export default function BookingStatusDonut({ data, title = 'Booking Status' }) {
  const chartData = useMemo(() => normalizeBookingStatus(data), [data]);
  const total = chartData.reduce((sum, item) => sum + Number(item.count || 0), 0);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${alpha(ACCENT, 0.22)}`,
        boxShadow: `0 10px 28px ${alpha(ACCENT, 0.16)}`,
        bgcolor: '#fff',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.35,
          display: 'flex',
          alignItems: 'center',
          gap: 1.1,
          background: `linear-gradient(135deg, ${ACCENT} 0%, #ef4444 100%)`,
          color: '#fff',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha('#fff', 0.18),
          }}
        >
          <DonutLargeRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="h6" fontWeight={800} fontSize="1.05rem" lineHeight={1.2}>
          {title}
        </Typography>
      </Box>

      <CardContent
        sx={{
          pt: 2,
          pb: 2.5,
          px: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {chartData.length ? (
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: `${SIZE}px minmax(0, 1fr)` },
              alignItems: 'center',
              columnGap: 2.5,
              rowGap: 2,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: SIZE,
                height: SIZE,
                mx: { xs: 'auto', sm: 0 },
                borderRadius: '50%',
                boxShadow: `0 0 0 10px ${alpha(ACCENT, 0.08)}`,
                justifySelf: { xs: 'center', sm: 'start' },
              }}
            >
              <PieChart width={SIZE} height={SIZE}>
                <Tooltip
                  formatter={(value, name, props) => {
                    const count = props?.payload?.count;
                    return count != null ? [`${count} (${value}%)`, name] : [`${value}%`, name];
                  }}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={3}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={`${entry.name}-${i}`}
                      fill={entry.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography fontWeight={800} fontSize={22} lineHeight={1.1} color="#0f172a">
                  {total}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.4}>
                  Total
                </Typography>
              </Box>
            </Box>

            <Box
              component="ul"
              sx={{
                m: 0,
                p: 0,
                listStyle: 'none',
                minWidth: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              {chartData.map((entry, i) => {
                const color = entry.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                return (
                  <Box
                    key={`${entry.name}-${i}`}
                    component="li"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '10px minmax(0, 1fr) auto auto',
                      alignItems: 'center',
                      columnGap: 1.25,
                      px: 1.25,
                      py: 0.85,
                      borderRadius: 1.5,
                      bgcolor: i % 2 ? alpha(color, 0.08) : 'transparent',
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      noWrap
                      title={entry.name}
                      sx={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}
                    >
                      {entry.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: '#0f172a', fontSize: 13, minWidth: 20, textAlign: 'right' }}
                    >
                      {entry.count}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 600, minWidth: 36, textAlign: 'right' }}
                    >
                      {entry.value}%
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box py={6} textAlign="center" width="100%">
            <Typography variant="body2" color="text.secondary">
              No enquiry status data yet
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
