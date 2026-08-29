import { useMemo } from 'react';
import { Grid } from '@mui/material';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import ReportTablePage from './ReportTablePage';
import StatCard from '../../components/common/StatCard';
import OwnershipTag from '../../components/common/OwnershipTag';
import { useVehicleReport } from '../../hooks/queries/useReports';
import { formatCurrency } from '../../utils/formatters';

export default function VehicleReport() {
  const columns = useMemo(
    () => [
      { id: 'code', name: 'Code', selector: (r) => r.code || '—' },
      { id: 'name', name: 'Vehicle', selector: (r) => r.name || '—', grow: 1 },
      { id: 'registration_number', name: 'Registration', selector: (r) => r.registration_number || '—' },
      { id: 'type', name: 'Type', selector: (r) => r.type || '—' },
      { id: 'ownership', name: 'Ownership', cell: (r) => <OwnershipTag type={r.ownership} /> },
      { id: 'trips', name: 'Trips', selector: (r) => r.trips || 0 },
      { id: 'total_km', name: 'Total KM', selector: (r) => Number(r.total_km || 0).toFixed(0) },
      { id: 'total_amount', name: 'Trip amount', selector: (r) => formatCurrency(r.total_amount || 0) },
      { id: 'availability_status', name: 'Availability', selector: (r) => r.availability_status || '—' },
    ],
    []
  );

  return (
    <ReportTablePage
      title="Vehicle Report"
      subtitle="Vehicle usage and trip totals for the selected period"
      columns={columns}
      useReport={useVehicleReport}
      summaryCards={(summary) => [
        <Grid key="vehicles" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Vehicles" value={summary?.vehicles ?? 0} icon={<DirectionsCarOutlinedIcon />} color="#0284c7" />
        </Grid>,
        <Grid key="trips" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Trips" value={summary?.trips ?? 0} icon={<DirectionsCarOutlinedIcon />} color="#0f766e" />
        </Grid>,
        <Grid key="amount" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Trip amount" value={formatCurrency(summary?.amount || 0)} icon={<DirectionsCarOutlinedIcon />} color="#ea580c" />
        </Grid>,
      ]}
      exportFilename="vehicle-report"
      tableKey="report-vehicles"
    />
  );
}
