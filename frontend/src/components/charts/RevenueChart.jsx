import { Card, CardContent, CardHeader, Box } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_DATA = [
  { month: 'Jan', revenue: 420000 },
  { month: 'Feb', revenue: 380000 },
  { month: 'Mar', revenue: 510000 },
  { month: 'Apr', revenue: 460000 },
  { month: 'May', revenue: 580000 },
  { month: 'Jun', revenue: 620000 },
  { month: 'Jul', revenue: 710000 },
];

export default function RevenueChart({ data, title = 'Sales Overview' }) {
  const chartData = Array.isArray(data) && data.length ? data : DEFAULT_DATA;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
      <CardContent>
        <Box height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#04a9f5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#04a9f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ef" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6c757d" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6c757d"
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#04a9f5"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
