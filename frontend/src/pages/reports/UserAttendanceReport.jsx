import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Card, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import { useAttendanceReport } from '../../hooks/queries/useReports';
import { formatDateTime } from '../../utils/formatters';

const PERIOD_OPTIONS = [
  { value: 'today', label: "Today's Attendance" },
  { value: 'yesterday', label: "Yesterday's Attendance" },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
];

const filterFieldSx = {
  minWidth: 220,
  '& .MuiOutlinedInput-root': {
    bgcolor: '#f3f4f6',
    borderRadius: 1.5,
  },
};

export default function UserAttendanceReport() {
  const [period, setPeriod] = useState('today');
  const [appliedPeriod, setAppliedPeriod] = useState('today');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('first_login_at');
  const [sortOrder, setSortOrder] = useState('asc');

  const params = useMemo(
    () => ({
      page,
      perPage,
      sortBy,
      sortOrder,
      period: appliedPeriod,
    }),
    [page, perPage, sortBy, sortOrder, appliedPeriod]
  );

  const { data, isLoading } = useAttendanceReport(params);
  const rows = data?.rows || [];
  const total = data?.pagination?.total || 0;
  const dateLabel = data?.summary?.date_label || '';

  const handleSearch = () => {
    setAppliedPeriod(period);
    setPage(1);
  };

  const handleReset = () => {
    setPeriod('today');
    setAppliedPeriod('today');
    setPage(1);
    setSortBy('first_login_at');
    setSortOrder('asc');
  };

  const handleSort = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'sr',
        name: 'Sr.',
        selector: (r) => r.sno || r.sr,
        width: '80px',
        grow: 0,
      },
      {
        id: 'name',
        name: 'Name',
        selector: (r) => r.username || r.employee_name || '—',
        sortable: true,
        sortField: 'username',
        grow: 1,
      },
      {
        id: 'first_login_at',
        name: 'First Login Time',
        selector: (r) => formatDateTime(r.first_login_at),
        sortable: true,
        sortField: 'first_login_at',
        grow: 1,
      },
      {
        id: 'logout_at',
        name: 'Logout',
        sortable: true,
        sortField: 'logout_at',
        grow: 1,
        selector: (r) => {
          if (!r.logout_at) return 'Active';
          const time = formatDateTime(r.logout_at);
          return r.logout_reason === 'timeout' ? `${time} (Auto)` : time;
        },
      },
      {
        id: 'last_update_at',
        name: 'Last Update',
        selector: (r) => formatDateTime(r.last_update_at),
        sortable: true,
        sortField: 'last_update_at',
        grow: 1,
      },
      {
        id: 'type',
        name: 'Type',
        selector: (r) => r.type || '—',
        width: '130px',
      },
      {
        id: 'working_hours',
        name: 'Working Hours',
        selector: (r) => r.working_hours || r.total_working_hours || '—',
        sortable: true,
        sortField: 'working_hours',
        width: '150px',
      },
    ],
    []
  );

  return (
    <Box>
      <PageHeader title="Attendance" subtitle="Login sessions and working hours" />
      <Card sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, boxShadow: '0 10px 28px rgba(21,34,56,0.06)' }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2.5 }}
        >
          <TextField
            select
            size="small"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={filterFieldSx}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{
              height: 40,
              px: 2.5,
              borderRadius: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              color: '#0d9488',
              borderColor: '#0d9488',
              bgcolor: '#fff',
              '&:hover': {
                borderColor: '#0f766e',
                bgcolor: 'rgba(13,148,136,0.06)',
              },
            }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              height: 40,
              px: 2.5,
              borderRadius: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              color: '#2563eb',
              borderColor: '#2563eb',
              bgcolor: '#fff',
              '&:hover': {
                borderColor: '#1d4ed8',
                bgcolor: 'rgba(37,99,235,0.06)',
              },
            }}
          >
            Reset
          </Button>
        </Stack>

        <Box
          sx={{
            bgcolor: '#f3f4f6',
            borderRadius: 1,
            px: 2,
            py: 1.25,
            mb: 0,
          }}
        >
          <Typography fontWeight={700} color="text.primary">
            {dateLabel || '—'}
          </Typography>
        </Box>

        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          totalRows={total}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          onSort={handleSort}
          searchable={false}
          exportFilename="attendance-report"
          tableKey="report-attendance"
          emptyTitle="Nothing Found"
          headerBackground="#e5e7eb"
          headerColor="#111827"
        />
      </Card>
    </Box>
  );
}
