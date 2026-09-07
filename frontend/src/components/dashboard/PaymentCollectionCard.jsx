import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { formatCurrency, formatDate } from '../../utils/formatters';

function tripDates(from, to) {
  const start = from ? formatDate(from, 'D MMM') : '';
  const end = to ? formatDate(to, 'D MMM') : '';
  if (start && end) return `${start}–${end}`;
  return start || end || '—';
}

export default function PaymentCollectionCard({
  rows = [],
  totalDue = 0,
  loading = false,
}) {
  const accent = '#0f766e';

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#fff',
        border: `1px solid ${alpha(accent, 0.18)}`,
        boxShadow: `0 8px 20px ${alpha('#0f172a', 0.06)}`,
        display: 'flex',
        flexDirection: 'column',
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
          background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 58%, #0369a1 100%)',
          color: '#fff',
        }}
      >
        <Box display="flex" alignItems="center" gap={0.8}>
          <AccountBalanceWalletRoundedIcon sx={{ fontSize: 18 }} />
          <Typography fontWeight={800} fontSize={14} lineHeight={1.2}>
            Payment Collection
          </Typography>
        </Box>
        <Typography fontWeight={800} fontSize={13}>
          {loading ? '—' : formatCurrency(totalDue)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns: '1fr 0.9fr 1.1fr 0.9fr',
          gap: 0.75,
          px: 1.5,
          py: 0.55,
          bgcolor: alpha(accent, 0.06),
        }}
      >
        {['Trip', 'Due', 'Dates', 'Status'].map((label) => (
          <Typography key={label} fontSize={11} fontWeight={800} color={accent}>
            {label}
          </Typography>
        ))}
      </Box>

      <Box sx={{ px: 0.75, py: 0.4 }}>
        {loading ? (
          <Typography variant="caption" color="text.secondary" py={1.5} display="block" textAlign="center">
            Loading…
          </Typography>
        ) : rows.length ? (
          rows.map((row, index) => (
            <Box
              key={row.id || row.tripId}
              component={RouterLink}
              to={`/enquiry/view/${row.id}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 0.9fr 1.1fr 0.9fr' },
                gap: 0.75,
                alignItems: 'center',
                px: 0.75,
                py: 0.45,
                textDecoration: 'none',
                color: 'inherit',
                bgcolor: index % 2 ? alpha(accent, 0.04) : 'transparent',
                borderRadius: 1,
                '&:hover': { bgcolor: alpha(accent, 0.08) },
              }}
            >
              <Typography fontWeight={700} fontSize={12} color="#0f172a" noWrap>
                {row.tripId || '—'}
              </Typography>
              <Typography fontWeight={800} fontSize={12} color="#b45309" noWrap>
                {formatCurrency(row.payment)}
              </Typography>
              <Typography fontWeight={600} fontSize={11.5} color="#334155" noWrap>
                {tripDates(row.travelFrom, row.travelTo)}
              </Typography>
              <Typography fontWeight={700} fontSize={11} color={row.statusColor || accent} noWrap>
                {row.status || 'Confirmed'}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="caption" color="text.secondary" py={1.5} display="block" textAlign="center">
            No pending collection
          </Typography>
        )}
      </Box>
    </Box>
  );
}
