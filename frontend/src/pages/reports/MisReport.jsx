import { useMemo } from 'react';
import { Grid } from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ReportTablePage from './ReportTablePage';
import StatCard from '../../components/common/StatCard';
import { useMisReport } from '../../hooks/queries/useReports';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EVENT_TYPE_OPTIONS } from '../../schemas/itinerary.schema';

const moneyCol = (id, name, field) => ({
  id,
  name,
  selector: (r) => formatCurrency(r[field] || 0),
  sortable: true,
  sortField: field,
  width: '140px',
  grow: 0,
  wrap: false,
  right: true,
});

export default function MisReport() {
  const columns = useMemo(
    () => [
      {
        id: 'sr',
        name: 'Sr.',
        selector: (r) => r.sr,
        width: '70px',
        grow: 0,
      },
      {
        id: 'booked_by',
        name: 'Booked By',
        selector: (r) => r.booked_by || '—',
        width: '230px',
        grow: 0,
        wrap: false,
      },
      {
        id: 'booked_by_email',
        name: 'Email',
        selector: (r) => r.booked_by_email || '—',
        width: '200px',
        grow: 0,
        wrap: false,
      },
      {
        id: 'mobile',
        name: 'Mobile',
        selector: (r) => r.mobile || '—',
        width: '130px',
        grow: 0,
      },
      {
        id: 'client_email',
        name: 'Email',
        selector: (r) => r.client_email || '—',
        width: '230px',
        grow: 0,
        wrap: false,
      },
      {
        id: 'enquiry_code',
        name: 'ID',
        selector: (r) => r.enquiry_code || '—',
        sortable: true,
        sortField: 'enquiry_code',
        width: '160px',
        grow: 0,
        wrap: false,
      },
      {
        id: 'booking_date',
        name: 'Booking Date',
        selector: (r) => formatDate(r.booking_date),
        sortable: true,
        sortField: 'booking_date',
        width: '140px',
        grow: 0,
      },
      {
        id: 'client',
        name: 'Client',
        selector: (r) => r.client || '—',
        sortable: true,
        sortField: 'client',
        width: '160px',
        grow: 0,
        wrap: false,
      },
      {
        id: 'destination',
        name: 'Destination',
        selector: (r) => r.destination || '—',
        sortable: true,
        sortField: 'destination',
        width: '160px',
        grow: 0,
        wrap: false,
      },
      {
        id: 'no_of_pax',
        name: 'No. of Pax',
        selector: (r) => r.no_of_pax ?? 0,
        sortable: true,
        sortField: 'no_of_pax',
        width: '110px',
        grow: 0,
        right: true,
      },
      moneyCol('selling_cost', 'Selling Cost', 'selling_cost'),
      ...EVENT_TYPE_OPTIONS.map((opt) =>
        moneyCol(`${opt.value}_cost`, `${opt.label} Cost`, `${opt.value}_cost`)
      ),
      moneyCol('total_cost', 'Total Cost', 'total_cost'),
      moneyCol('gross_profit', 'Gross Profit', 'gross_profit'),
      moneyCol('gst', 'GST', 'gst'),
    ],
    []
  );

  return (
    <ReportTablePage
      title="MIS"
      subtitle="Management information for bookings in the selected period"
      columns={columns}
      useReport={useMisReport}
      defaultSortBy="booking_date"
      showFullText
      summaryCards={(summary) => [
        <Grid key="count" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Bookings"
            value={summary?.count ?? 0}
            icon={<AssessmentOutlinedIcon />}
            color="#0284c7"
            tinted
          />
        </Grid>,
        <Grid key="selling" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Selling cost"
            value={formatCurrency(summary?.selling_cost || 0)}
            icon={<PaymentsOutlinedIcon />}
            color="#0f766e"
            tinted
          />
        </Grid>,
        <Grid key="profit" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Gross profit"
            value={formatCurrency(summary?.gross_profit || 0)}
            icon={<TrendingUpOutlinedIcon />}
            color="#16a34a"
            tinted
          />
        </Grid>,
        <Grid key="pax" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total pax"
            value={summary?.pax ?? 0}
            icon={<GroupsOutlinedIcon />}
            color="#7c3aed"
            tinted
          />
        </Grid>,
      ]}
      exportFilename="mis-report"
      tableKey="report-mis"
    />
  );
}
