import { useMemo, useState } from 'react';
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
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/formatters';
import { useProfitLossTrend } from '../../hooks/queries/useDashboard';

const INCOME = '#22c55e';
const EXPENSE = '#ef4444';
const PROFIT = '#3b82f6';

export default function ProfitLossTrendChart() {
  const [from, setFrom] = useState(dayjs().subtract(5, 'month').startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [applied, setApplied] = useState({ from, to });
  const { data, isLoading } = useProfitLossTrend(applied);

  const monthly = useMemo(() => {
    if (Array.isArray(data?.monthly)) return data.monthly;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            Profit & Loss Overview
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            type="date"
            size="small"
            label="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ bgcolor: '#fff' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            type="date"
            size="small"
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ bgcolor: '#fff' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            variant="contained"
            onClick={() => setApplied({ from, to })}
            fullWidth
            sx={{ height: 40, textTransform: 'none', fontWeight: 700 }}
          >
            Apply
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mb: 1.5 }} />

      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
          bgcolor: '#fff',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography fontWeight={800} fontSize="1.05rem" color="#0f172a" mb={1}>
            Profit & Loss Trend
          </Typography>
          <Box sx={{ width: '100%', height: 340 }}>
            {isLoading ? (
              <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                <Typography color="text.secondary">Loading…</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthly} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="plIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={INCOME} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={INCOME} stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="plExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={EXPENSE} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={EXPENSE} stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="plProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PROFIT} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={PROFIT} stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => Number(value).toLocaleString('en-IN')}
                    label={{
                      value: 'Amount (₹)',
                      position: 'top',
                      offset: 12,
                      style: { fill: '#64748b', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                  <Legend
                    iconType="rect"
                    wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke={INCOME}
                    strokeWidth={2}
                    fill="url(#plIncome)"
                    dot={{ r: 4, fill: INCOME, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke={EXPENSE}
                    strokeWidth={2}
                    fill="url(#plExpense)"
                    dot={{ r: 4, fill: EXPENSE, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke={PROFIT}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: PROFIT, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
