import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';

const DEFAULT_BOOKINGS = [
  { id: 'BK-1248', customer: 'Rajesh Kumar', package: 'Goa Beach Escape', travelDate: '2026-08-15', amount: 45000, status: 'confirmed' },
  { id: 'BK-1247', customer: 'Priya Sharma', package: 'Kerala Backwaters', travelDate: '2026-08-20', amount: 62000, status: 'confirmed' },
  { id: 'BK-1246', customer: 'Amit Patel', package: 'Manali Adventure', travelDate: '2026-09-01', amount: 38500, status: 'pending' },
  { id: 'BK-1245', customer: 'Sneha Reddy', package: 'Thailand Explorer', travelDate: '2026-09-10', amount: 95000, status: 'confirmed' },
  { id: 'BK-1244', customer: 'Vikram Singh', package: 'Rajasthan Royal', travelDate: '2026-09-18', amount: 52000, status: 'pending' },
];

const statusColor = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error',
  completed: 'info',
};

export default function RecentBookingsTable({ data, title = 'Recent Bookings' }) {
  const navigate = useNavigate();
  const rows = Array.isArray(data) && data.length ? data : DEFAULT_BOOKINGS;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 700, fontSize: '1rem' }}
        action={
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => navigate('/bookings')}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            View All
          </Button>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Package</TableCell>
                <TableCell>Travel Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {row.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.customer || row.customerName}</TableCell>
                  <TableCell>{row.package || row.packageName}</TableCell>
                  <TableCell>{formatDate(row.travelDate || row.travel_date)}</TableCell>
                  <TableCell>{formatCurrency(row.amount || row.totalAmount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={statusColor[row.status] || 'default'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}
