import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { mainCityName } from '../../utils/formatters';

const ACCENT = '#0369A1';

function groupByCity(rows = []) {
  const map = new Map();
  rows.forEach((item) => {
    const city = mainCityName(item?.name) || String(item?.name || '').trim();
    if (!city) return;
    const key = city.toLowerCase();
    const current = map.get(key) || { id: key, name: city, queries: 0 };
    current.queries += Number(item.queries || 0);
    map.set(key, current);
  });
  return Array.from(map.values())
    .filter((item) => Number(item.queries) > 0)
    .sort((a, b) => b.queries - a.queries || a.name.localeCompare(b.name));
}

export default function TopDestinations({ data = [], loading = false }) {
  const destinations = groupByCity(Array.isArray(data) ? data : []);
  const totalQueries = destinations.reduce((sum, item) => sum + Number(item.queries || 0), 0);

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#fff',
        backgroundColor: '#fff',
        border: `1px solid ${alpha(ACCENT, 0.16)}`,
        boxShadow: `0 8px 20px ${alpha('#0F172A', 0.06)}`,
        display: 'flex',
        flexDirection: 'column',
        isolation: 'isolate',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: ACCENT,
          backgroundColor: ACCENT,
          color: '#fff',
        }}
      >
        <Typography fontWeight={800} fontSize={14} color="#fff">
          Top Destinations
        </Typography>
        <Typography fontSize={12} fontWeight={700} color="#fff">
          {loading ? '—' : totalQueries}
        </Typography>
      </Box>

      <Box
        sx={{
          px: 1.25,
          py: 0.6,
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.45,
        }}
      >
        {loading ? (
          <Typography variant="caption" color="text.secondary" textAlign="center" py={1.5}>
            Loading…
          </Typography>
        ) : !destinations.length ? (
          <Typography variant="caption" color="text.secondary" textAlign="center" py={1.5}>
            No destinations yet
          </Typography>
        ) : (
          destinations.map((dest, index) => {
            const queries = Number(dest.queries || 0);
            return (
              <Box
                key={dest.id || dest.name}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '16px 1fr 28px',
                  alignItems: 'center',
                  columnGap: 0.6,
                  minWidth: 0,
                }}
              >
                <Typography fontSize={11} fontWeight={800} color={ACCENT}>
                  {index + 1}
                </Typography>
                <Typography fontSize={12} fontWeight={700} noWrap color="#0F172A">
                  {dest.name}
                </Typography>
                <Typography fontSize={11} fontWeight={800} textAlign="right" color="#334155">
                  {queries}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
