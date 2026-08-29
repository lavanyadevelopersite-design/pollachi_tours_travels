import { useMemo } from 'react';
import { Grid } from '@mui/material';
import AirlineSeatReclineNormalOutlinedIcon from '@mui/icons-material/AirlineSeatReclineNormalOutlined';
import ReportTablePage from './ReportTablePage';
import StatCard from '../../components/common/StatCard';
import OwnershipTag from '../../components/common/OwnershipTag';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import { useDriverReport } from '../../hooks/queries/useReports';
import { formatCurrency } from '../../utils/formatters';

export default function DriverReport() {
  const columns = useMemo(
    () => [
      { id: 'code', name: 'Code', selector: (r) => r.code || '—' },
      { id: 'full_name', name: 'Driver', selector: (r) => r.full_name || '—', grow: 1 },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="phone" typographyVariant="body2" />,
      },
      { id: 'driver_type', name: 'Type', cell: (r) => <OwnershipTag type={r.driver_type} /> },
      { id: 'trips', name: 'Trips', selector: (r) => r.trips || 0 },
      { id: 'total_km', name: 'Total KM', selector: (r) => Number(r.total_km || 0).toFixed(0) },
      { id: 'total_amount', name: 'Trip amount', selector: (r) => formatCurrency(r.total_amount || 0) },
      { id: 'availability_status', name: 'Availability', selector: (r) => r.availability_status || '—' },
    ],
    []
  );

  return (
    <ReportTablePage
      title="Drivers Report"
      subtitle="Driver assignments and trip totals for the selected period"
      columns={columns}
      useReport={useDriverReport}
      summaryCards={(summary) => [
        <Grid key="drivers" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Drivers" value={summary?.drivers ?? 0} icon={<AirlineSeatReclineNormalOutlinedIcon />} color="#0284c7" />
        </Grid>,
        <Grid key="trips" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Trips" value={summary?.trips ?? 0} icon={<AirlineSeatReclineNormalOutlinedIcon />} color="#0f766e" />
        </Grid>,
        <Grid key="amount" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Trip amount" value={formatCurrency(summary?.amount || 0)} icon={<AirlineSeatReclineNormalOutlinedIcon />} color="#ea580c" />
        </Grid>,
      ]}
      exportFilename="driver-report"
      tableKey="report-drivers"
    />
  );
}
