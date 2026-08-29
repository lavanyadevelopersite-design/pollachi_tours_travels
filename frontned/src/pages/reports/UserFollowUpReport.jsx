import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import ReportTablePage from './ReportTablePage';
import SelectFilter from '../../components/common/SelectFilter';
import StatusBadge from '../../components/common/StatusBadge';
import { useFollowUpReport } from '../../hooks/queries/useReports';
import { useUsers } from '../../hooks/queries/useUsers';
import { formatDateTime, truncate } from '../../utils/formatters';
import { FOLLOW_UP_STATUSES } from '../../utils/constants';

function userName(user) {
  if (!user) return '—';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—';
}

export default function UserFollowUpReport() {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const { data: usersData } = useUsers({ page: 1, perPage: 300, sortBy: 'first_name', sortOrder: 'asc' });
  const userOptions = useMemo(
    () =>
      (usersData?.rows || []).map((u) => ({
        value: u.id,
        label: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
      })),
    [usersData]
  );

  const columns = useMemo(
    () => [
      {
        id: 'enquiry',
        name: 'Enquiry',
        cell: (row) => {
          const code = row.enquiry?.enquiry_code || row.lead?.lead_code || '—';
          if (!row.enquiry_id) return code;
          return (
            <Link component={RouterLink} to={`/enquiry/view/${row.enquiry_id}`} underline="hover" fontWeight={700}>
              {code}
            </Link>
          );
        },
      },
      {
        id: 'customer',
        name: 'Customer',
        selector: (row) => row.enquiry?.customer_name || '—',
      },
      { id: 'type', name: 'Type', selector: (r) => r.type || '—' },
      { id: 'status', name: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
      { id: 'follow_up_date', name: 'Follow-up date', selector: (r) => formatDateTime(r.follow_up_date) },
      { id: 'assignee', name: 'Assigned to', selector: (r) => userName(r.assignee) },
      { id: 'notes', name: 'Notes', selector: (r) => truncate(r.notes || '—', 60), grow: 1 },
    ],
    []
  );

  return (
    <ReportTablePage
      title="User Follow-ups"
      subtitle="Follow-up activity by user for the selected period"
      columns={columns}
      useReport={useFollowUpReport}
      extraFilterState={{
        ...(userId ? { assigned_to: userId } : {}),
        ...(status ? { status } : {}),
      }}
      extraFilters={
        <>
          <SelectFilter label="User" value={userId} onChange={setUserId} options={userOptions} minWidth={200} />
          <SelectFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={FOLLOW_UP_STATUSES}
          />
        </>
      }
      exportFilename="user-followups-report"
      tableKey="report-followups"
    />
  );
}
