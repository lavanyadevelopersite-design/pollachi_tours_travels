import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import ReportTablePage from './ReportTablePage';
import SelectFilter from '../../components/common/SelectFilter';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import { useEnquiryReport } from '../../hooks/queries/useReports';
import { useLeadStatuses } from '../../hooks/queries/useMasters';
import { formatDate, formatRouteLabel } from '../../utils/formatters';

export default function EnquiryReport() {
  const [statusId, setStatusId] = useState('');
  const { data: statusData } = useLeadStatuses({ page: 1, perPage: 200, is_active: true });
  const statusOptions = useMemo(
    () =>
      (statusData?.rows || []).map((s) => ({
        value: s.id,
        label: s.lead_status,
      })),
    [statusData]
  );

  const columns = useMemo(
    () => [
      { id: 'enquiry_code', name: 'Enquiry #', selector: (r) => r.enquiry_code || '—', sortable: true, sortField: 'enquiry_code' },
      {
        id: 'customer_name',
        name: 'Customer',
        cell: (r) => (
          <Link component={RouterLink} to={`/enquiry/view/${r.id}`} underline="hover" fontWeight={700}>
            {r.customer_name || '—'}
          </Link>
        ),
        grow: 1,
      },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="whatsapp" typographyVariant="body2" />,
      },
      {
        id: 'route',
        name: 'Route',
        selector: (r) =>
          formatRouteLabel(r.travel_from_destination, r.travel_to_destination, '—'),
        grow: 1,
      },
      {
        id: 'travel_from',
        name: 'Travel dates',
        selector: (r) =>
          [formatDate(r.travel_from), formatDate(r.travel_to)].filter((v) => v !== '—').join(' – ') || '—',
        sortable: true,
        sortField: 'travel_from',
      },
      { id: 'status', name: 'Status', selector: (r) => r.leadStatus?.lead_status || '—' },
      {
        id: 'assignee',
        name: 'Assigned to',
        selector: (r) =>
          [r.assignee?.first_name, r.assignee?.last_name].filter(Boolean).join(' ') || '—',
      },
      {
        id: 'created_at',
        name: 'Created',
        selector: (r) => formatDate(r.created_at),
        sortable: true,
        sortField: 'created_at',
      },
    ],
    []
  );

  return (
    <ReportTablePage
      title="Enquiry Report"
      subtitle="Enquiries created in the selected period"
      columns={columns}
      useReport={useEnquiryReport}
      extraFilterState={statusId ? { lead_status_id: statusId } : {}}
      extraFilters={
        <SelectFilter
          label="Lead status"
          value={statusId}
          onChange={setStatusId}
          options={statusOptions}
          minWidth={200}
        />
      }
      exportFilename="enquiry-report"
      tableKey="report-enquiries"
    />
  );
}
