import {
  Box,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  MenuItem,
  Select,
  Typography,
  alpha,
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import { dashboardGlassCardSx } from '../../utils/dashboardData';

export default function PaymentSummary({
  received = 1875400,
  pending = 1011200,
  percent = 65,
  title = 'Payment Summary',
  transparent = false,
}) {
  const radius = 70;
  const circumference = Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <Card sx={{ height: '100%', ...(transparent ? dashboardGlassCardSx : {}) }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 700, fontSize: '1rem' }}
        action={
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select defaultValue="month" sx={{ borderRadius: 2, fontSize: 13, bgcolor: '#fff' }}>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
            </Select>
          </FormControl>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box flex={1}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#22c55e', 0.08),
                border: '1px solid',
                borderColor: alpha('#22c55e', 0.18),
                mb: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Received
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main" mt={0.5}>
                {formatCurrency(received)}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#f59e0b', 0.08),
                border: '1px solid',
                borderColor: alpha('#f59e0b', 0.18),
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Pending
              </Typography>
              <Typography variant="h6" fontWeight={700} color="warning.main" mt={0.5}>
                {formatCurrency(pending)}
              </Typography>
            </Box>
          </Box>

          <Box position="relative" width={150} height={90} flexShrink={0}>
            <svg width={150} height={90} viewBox="0 0 150 90">
              <path
                d="M 15 80 A 60 60 0 0 1 135 80"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={12}
                strokeLinecap="round"
              />
              <path
                d="M 15 80 A 60 60 0 0 1 135 80"
                fill="none"
                stroke="#2196f3"
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <Box
              position="absolute"
              bottom={4}
              left="50%"
              sx={{ transform: 'translateX(-50%)', textAlign: 'center' }}
            >
              <Typography variant="h6" fontWeight={700} color="primary.main" lineHeight={1}>
                {percent}%
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize={10}>
                Received
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
