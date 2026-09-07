import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate, formatRouteLabel } from '../../utils/formatters';

const ACCENT = '#4C1D95';

export default function UpcomingToursCard({ rows = [], loading = false }) {
  const items = Array.isArray(rows) ? rows : [];

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        bgcolor: '#fff',
        backgroundColor: '#fff',
        border: '1px solid #EDE9FE',
        boxShadow: '0 6px 16px rgba(76, 29, 149, 0.08)',
        isolation: 'isolate',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: ACCENT,
          backgroundColor: ACCENT,
          color: '#fff',
        }}
      >
        <Typography fontWeight={800} fontSize={14} color="#fff">
          Upcoming Tours
        </Typography>
        <Typography fontSize={11} fontWeight={700} color="#EDE9FE">
          Next 7 days{loading ? '' : items.length ? ` · ${items.length}` : ''}
        </Typography>
      </Box>

      <Box sx={{ px: 1.25, py: 0.75, bgcolor: '#fff' }}>
        {loading ? (
          <Typography fontSize={12} color="#64748B" textAlign="center" py={1}>
            Loading…
          </Typography>
        ) : !items.length ? (
          <Typography fontSize={12} color="#94A3B8" textAlign="center" py={1}>
            No tours in next 7 days
          </Typography>
        ) : (
          items.map((row, index) => {
            const route = formatRouteLabel(row.fromCity, row.toCity, row.toCity || '—');
            return (
              <Box
                key={row.id || index}
                component={RouterLink}
                to={`/enquiry/view/${row.enquiryId || row.id}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr auto',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.65,
                  textDecoration: 'none',
                  color: 'inherit',
                  borderTop: index ? '1px solid #F1F5F9' : 0,
                  '&:hover .ut-name': { color: ACCENT },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    borderRadius: 1,
                    bgcolor: '#F5F3FF',
                    backgroundColor: '#F5F3FF',
                    textAlign: 'center',
                    py: 0.35,
                  }}
                >
                  <Typography fontSize={13} fontWeight={800} color={ACCENT} lineHeight={1.1}>
                    {formatDate(row.travelFrom, 'DD')}
                  </Typography>
                  <Typography fontSize={9} fontWeight={800} color="#6D28D9" letterSpacing={0.4}>
                    {formatDate(row.travelFrom, 'MMM')}
                  </Typography>
                </Box>
                <Box minWidth={0}>
                  <Typography className="ut-name" fontSize={12.5} fontWeight={800} color="#0F172A" noWrap>
                    {row.code ? `${row.code} · ${route}` : route}
                  </Typography>
                  <Typography fontSize={11} color="#64748B" noWrap>
                    {row.customer}
                    {row.pax ? ` · ${row.pax} pax` : ''}
                  </Typography>
                </Box>
                <Typography fontSize={11} fontWeight={700} color="#64748B" noWrap>
                  {formatDate(row.travelFrom, 'D MMM')}
                  {row.travelTo ? `–${formatDate(row.travelTo, 'D MMM')}` : ''}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
