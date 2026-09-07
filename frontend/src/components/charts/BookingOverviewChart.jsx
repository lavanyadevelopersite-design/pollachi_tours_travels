import { Box, Card, CardContent, CardHeader, FormControl, MenuItem, Select } from '@mui/material';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { DEMO_BOOKING_OVERVIEW, normalizeChartData } from '../../utils/dashboardData';

export default function BookingOverviewChart({ data, title = 'Booking Overview' }) {
  const chartData = normalizeChartData(data, DEMO_BOOKING_OVERVIEW);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 700, fontSize: '1rem' }}
        action={
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select defaultValue="month" sx={{ borderRadius: 2, fontSize: 13, bgcolor: '#fff' }}>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Box width="100%" height={300} minHeight={300}>
          <ResponsiveContainer width="100%" height={300} initialDimension={{ width: 600, height: 300 }}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(value, name) =>
                  name === 'Revenue (₹)' ? formatCurrency(value) : value
                }
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Revenue (₹)"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#revenueArea)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="#2196f3"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2196f3', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
