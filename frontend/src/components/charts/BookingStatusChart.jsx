import { Card, CardContent, CardHeader, Box } from '@mui/material';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { DEMO_BOOKING_STATUS, normalizeBookingStatus } from '../../utils/dashboardData';



const COLORS = ['#04a9f5', '#1de9b6', '#f4c22b', '#f44236', '#3ebfea', '#3f4d67'];



export default function BookingStatusChart({ data, title = 'Booking Status' }) {

  const chartData = normalizeBookingStatus(data ?? DEMO_BOOKING_STATUS);



  return (

    <Card sx={{ height: '100%' }}>

      <CardHeader title={title} titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />

      <CardContent>

        <Box width="100%" height={280} minHeight={280}>

          <ResponsiveContainer

            width="100%"

            height={280}

            initialDimension={{ width: 400, height: 280 }}

          >

            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>

              <Pie

                data={chartData}

                dataKey="value"

                nameKey="name"

                cx="50%"

                cy="50%"

                innerRadius="55%"

                outerRadius="85%"

                paddingAngle={3}

                isAnimationActive={false}

              >

                {chartData.map((entry, i) => (

                  <Cell key={`${entry.name}-${i}`} fill={COLORS[i % COLORS.length]} />

                ))}

              </Pie>

              <Tooltip formatter={(value, name) => [`${value}%`, name]} />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </Box>

      </CardContent>

    </Card>

  );

}

