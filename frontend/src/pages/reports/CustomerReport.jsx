import { useMemo } from 'react';
import { Grid } from '@mui/material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import ReportTablePage from './ReportTablePage';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import StatCard from '../../components/common/StatCard';
import { useCustomerReport } from '../../hooks/queries/useReports';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CustomerReport() {
  const columns = useMemo(
    () => [
      { id: 'customer_name', name: 'Customer', selector: (r) => r.customer_name || '—', grow: 1 },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="whatsapp" typographyVariant="body2" />,
      },
      { id: 'email', name: 'Email', selector: (r) => r.email || '—' },
      { id: 'enquiry_count', name: 'Enquiries', selector: (r) => r.enquiry_count || 0 },
      { id: 'estimated_value', name: 'Estimated value', selector: (r) => formatCurrency(r.estimated_value || 0) },
      { id: 'first_enquiry_at', name: 'First enquiry', selector: (r) => formatDate(r.first_enquiry_at) },
      { id: 'last_enquiry_at', name: 'Last enquiry', selector: (r) => formatDate(r.last_enquiry_at) },
    ],
    []
  );

  return (
    <ReportTablePage
      title="Customer Report"
      subtitle="Unique customers from enquiries in the selected period"
      columns={columns}
      useReport={useCustomerReport}
      summaryCards={(summary) => [
        <Grid key="customers" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Customers" value={summary?.customers ?? 0} icon={<PeopleOutlinedIcon />} color="#7c3aed" />
        </Grid>,
        <Grid key="enquiries" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Enquiries" value={summary?.enquiries ?? 0} icon={<ContactMailOutlinedIcon />} color="#0284c7" />
        </Grid>,
      ]}
      exportFilename="customer-report"
      tableKey="report-customers"
    />
  );
}
