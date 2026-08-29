import { useCallback, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SelectFilter from '../../components/common/SelectFilter';
import { formatDateTime } from '../../utils/formatters';
import { useSnackbar } from 'notistack';

const DEMO = [
  { id: 1, title: 'New lead assigned', message: 'Priya Sharma assigned to you', read: false, createdAt: '2026-07-20T08:30:00' },
  { id: 2, title: 'Payment received', message: '₹20,000 for BK-0891', read: false, createdAt: '2026-07-19T16:10:00' },
  { id: 3, title: 'Follow-up reminder', message: 'Call Vikram Singh today', read: true, createdAt: '2026-07-19T09:00:00' },
];

export default function NotificationList() {
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const handleSearch = useCallback((v) => { setSearch(v); setPage(1); }, []);

  const columns = useMemo(() => [
    { id: 'title', name: 'Title', selector: (r) => r.title, grow: 1 },
    { id: 'message', name: 'Message', selector: (r) => r.message, grow: 2 },
    { id: 'read', name: 'Status', cell: (r) => <StatusBadge status={r.read ? 'completed' : 'new'} label={r.read ? 'Read' : 'Unread'} /> },
    { id: 'createdAt', name: 'Time', selector: (r) => formatDateTime(r.createdAt) },
  ], []);

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="System and activity alerts"
        extra={
          <Button variant="outlined" onClick={() => enqueueSnackbar('All marked as read', { variant: 'success' })}>
            Mark all read
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={DEMO.filter((r) => {
          const matchesSearch = !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
          const matchesStatus =
            !statusFilter ||
            (statusFilter === 'read' && r.read) ||
            (statusFilter === 'unread' && !r.read);
          return matchesSearch && matchesStatus;
        })}
        totalRows={DEMO.length}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        searchValue={search}
        onSearch={handleSearch}
        tableKey="notifications"
        exportFilename="notifications"
        paginationServer={false}
        filters={
          <SelectFilter
            label="Status"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ]}
          />
        }
      />
    </Box>
  );
}
