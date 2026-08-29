import { Box, Card, CardActionArea, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import AirlineSeatReclineNormalOutlinedIcon from '@mui/icons-material/AirlineSeatReclineNormalOutlined';
import PhoneCallbackOutlinedIcon from '@mui/icons-material/PhoneCallbackOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PageHeader from '../../components/common/PageHeader';

const REPORTS = [
  { title: 'Profit and Loss', path: '/reports/profit-loss', icon: AccountBalanceOutlinedIcon, color: '#0f766e' },
  { title: 'Enquiry Report', path: '/reports/enquiries', icon: ContactMailOutlinedIcon, color: '#0284c7' },
  { title: 'Expenses Report', path: '/reports/expenses', icon: ReceiptLongOutlinedIcon, color: '#ea580c' },
  { title: 'Customer Report', path: '/reports/customers', icon: GroupsOutlinedIcon, color: '#7c3aed' },
  { title: 'Vehicle Report', path: '/reports/vehicles', icon: DirectionsCarOutlinedIcon, color: '#2563eb' },
  { title: 'Drivers Report', path: '/reports/drivers', icon: AirlineSeatReclineNormalOutlinedIcon, color: '#0891b2' },
  { title: 'User Follow-ups', path: '/reports/follow-ups', icon: PhoneCallbackOutlinedIcon, color: '#d97706' },
  { title: 'User Attendance', path: '/reports/attendance', icon: FactCheckOutlinedIcon, color: '#475569' },
];

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Business, operations, and attendance reports"
      />
      <Grid container spacing={2.5}>
        {REPORTS.map((report) => (
          <Grid key={report.path} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardActionArea onClick={() => navigate(report.path)} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${report.color}18`,
                      color: report.color,
                      display: 'grid',
                      placeItems: 'center',
                      mb: 1.5,
                    }}
                  >
                    <report.icon />
                  </Box>
                  <Typography fontWeight={800}>{report.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Open report
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
