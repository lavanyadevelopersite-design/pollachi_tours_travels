import { Card, CardContent, CardHeader, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DEFAULT_DATA = [
  { name: 'Website', value: 120 },
  { name: 'Referral', value: 85 },
  { name: 'Social', value: 64 },
  { name: 'Walk-in', value: 42 },
  { name: 'Phone', value: 38 },
];

export default function LeadSourceChart({ data, title = 'Lead Sources' }) {
  const chartData = Array.isArray(data) && data.length ? data : DEFAULT_DATA;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
      <CardContent>
        <Box height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ef" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3ebfea" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
