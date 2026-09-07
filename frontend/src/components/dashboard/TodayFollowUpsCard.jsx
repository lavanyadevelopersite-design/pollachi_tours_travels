import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

function typeLabel(type) {
  const text = String(type || 'task').trim();
  if (!text) return 'Task';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function TodayFollowUpsCard({ rows = [], loading = false }) {
  const items = Array.isArray(rows) ? rows : [];

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        bgcolor: '#fff',
        backgroundColor: '#fff',
        border: '1px solid #FED7AA',
        boxShadow: '0 6px 16px rgba(194, 65, 12, 0.08)',
        isolation: 'isolate',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: '#C2410C',
          backgroundColor: '#C2410C',
          color: '#ffffff',
        }}
      >
        <Typography fontWeight={800} fontSize={14} sx={{ color: '#ffffff' }}>
          Task / Followup&apos;s
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: '#fff',
          backgroundColor: '#fff',
          px: 1.25,
          py: 0.75,
        }}
      >
        {loading ? (
          <Typography fontSize={12} color="#64748B" textAlign="center" py={1}>
            Loading…
          </Typography>
        ) : !items.length ? (
          <Typography fontSize={12} color="#94A3B8" textAlign="center" py={1}>
            No follow-ups created today
          </Typography>
        ) : (
          items.map((row, index) => {
            const to = row.enquiryId ? `/enquiry/view/${row.enquiryId}` : '/follow-ups';
            return (
              <Box
                key={row.id || index}
                component={RouterLink}
                to={to}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.55,
                  textDecoration: 'none',
                  color: 'inherit',
                  borderTop: index ? '1px solid #E2E8F0' : 0,
                  '&:hover .fu-name': { color: '#0F766E' },
                }}
              >
                <Typography fontSize={11} fontWeight={700} color="#64748B" noWrap>
                  {typeLabel(row.type)}
                </Typography>
                <Typography className="fu-name" fontSize={12.5} fontWeight={700} color="#0F172A" noWrap>
                  {row.code ? `${row.code} · ${row.customer}` : row.customer}
                </Typography>
                <Typography fontSize={11} fontWeight={700} color="#475569" noWrap>
                  {formatDate(row.createdAt, 'hh:mm A')}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
