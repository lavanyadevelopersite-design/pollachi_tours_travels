import { useMemo, useState } from 'react';
import { Chip } from '@mui/material';
import ReportTablePage from './ReportTablePage';
import SelectFilter from '../../components/common/SelectFilter';
import { useAttendanceReport } from '../../hooks/queries/useReports';
import { useUsers } from '../../hooks/queries/useUsers';
import { colors } from '../../theme/palette';

export default function UserAttendanceReport() {
  const [userId, setUserId] = useState('');
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
      { id: 'employee_id', name: 'Emp ID', selector: (r) => r.employee_id || '—' },
      { id: 'username', name: 'User', selector: (r) => r.username || r.employee_name || '—', grow: 1 },
      { id: 'email', name: 'Email', selector: (r) => r.email || '—' },
      { id: 'department', name: 'Department', selector: (r) => r.department || '—' },
      { id: 'branch', name: 'Branch', selector: (r) => r.branch || '—' },
      { id: 'sessions_count', name: 'Sessions', selector: (r) => r.sessions_count || 0 },
      { id: 'working_hours', name: 'Working hours', selector: (r) => r.working_hours || r.total_working_hours || '—' },
      {
        id: 'status',
        name: 'Status',
        cell: (r) => (
          <Chip
            size="small"
            label={r.status || 'Offline'}
            sx={{
              fontWeight: 700,
              bgcolor: r.status === 'Online' ? colors.successLight : '#e2e8f0',
              color: r.status === 'Online' ? '#166534' : '#475569',
            }}
          />
        ),
      },
    ],
    []
  );

  return (
    <ReportTablePage
      title="User Attendance"
      subtitle="Login track and working hours by user"
      columns={columns}
      useReport={useAttendanceReport}
      extraFilterState={userId ? { user_id: userId } : {}}
      extraFilters={
        <SelectFilter label="User" value={userId} onChange={setUserId} options={userOptions} minWidth={200} />
      }
      exportFilename="user-attendance-report"
      tableKey="report-attendance"
    />
  );
}
