import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import SelectFilter from '../../components/common/SelectFilter';
import { useFollowUps } from '../../hooks/queries/useModules';
import { formatDateTime, truncate } from '../../utils/formatters';
import { FOLLOW_UP_STATUSES, FOLLOW_UP_TYPES } from '../../utils/constants';

function userName(user) {
  if (!user) return '—';
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  return name || user.email || '—';
}

function enquiryCode(row) {
  return row.enquiry?.enquiry_code || row.lead?.lead_code || '—';
}

function customerName(row) {
  if (row.enquiry?.customer_name) return row.enquiry.customer_name;
  if (row.lead) {
    const name = [row.lead.first_name, row.lead.last_name].filter(Boolean).join(' ');
    return name || '—';
  }
  return '—';
}

export default function FollowUpList() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('follow_up_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [appliedFrom, setAppliedFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [appliedTo, setAppliedTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (appliedFrom) params.from = appliedFrom;
    if (appliedTo) params.to = appliedTo;
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, appliedFrom, appliedTo, statusFilter, typeFilter]);

  const { data, isLoading } = useFollowUps(listParams);
  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleDateSearch = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setPage(1);
  };

  const columns = useMemo(
    () => [
      {
        id: 'sno',
        name: 'S.No',
        width: '70px',
        cell: (_row, index) => (page - 1) * perPage + index + 1,
      },
      {
        id: 'enquiryCode',
        name: 'Enquiry ID',
        minWidth: '150px',
        cell: (row) => {
          const code = enquiryCode(row);
          if (code === '—' || !row.enquiry_id) {
            return (
              <Typography variant="body2" fontWeight={600}>
                {code}
              </Typography>
            );
          }
          return (
            <Link
              component={RouterLink}
              to={`/enquiry/view/${row.enquiry_id}`}
              underline="hover"
              fontWeight={700}
              variant="body2"
            >
              {code}
            </Link>
          );
        },
      },
      {
        id: 'customer',
        name: 'Customer',
        selector: (r) => customerName(r),
        minWidth: '140px',
        grow: 1,
      },
      {
        id: 'type',
        name: 'Type',
        selector: (r) => r.type || '—',
        sortable: true,
        sortField: 'type',
        width: '110px',
        cell: (r) => (
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {r.type || '—'}
          </Typography>
        ),
      },
      {
        id: 'follow_up_date',
        name: 'Follow-up Date',
        selector: (r) => formatDateTime(r.follow_up_date || r.followUpDate),
        sortable: true,
        sortField: 'follow_up_date',
        minWidth: '170px',
      },
      {
        id: 'notes',
        name: 'Description',
        selector: (r) => truncate(r.notes, 60) || '—',
        grow: 1.5,
        minWidth: '180px',
      },
      {
        id: 'status',
        name: 'Status',
        width: '120px',
        sortable: true,
        sortField: 'status',
        cell: (r) => <StatusBadge status={r.status || 'pending'} />,
      },
      {
        id: 'assignedTo',
        name: 'Assigned To',
        selector: (r) => userName(r.assignee),
        minWidth: '130px',
      },
      {
        id: 'createdBy',
        name: 'Created By',
        selector: (r) => userName(r.creator),
        minWidth: '130px',
      },
      {
        id: 'reminder',
        name: 'Reminder',
        width: '100px',
        selector: (r) => (r.reminder ? 'Yes' : 'No'),
      },
      {
        id: 'outcome',
        name: 'Outcome',
        selector: (r) => truncate(r.outcome, 50) || '—',
        minWidth: '140px',
        grow: 1,
      },
    ],
    [page, perPage]
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader title="Follow-ups" subtitle="Enquiry follow-up history and schedules" />

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
          p: 2,
          bgcolor: '#fff',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          size="small"
          type="date"
          label="From Date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 170 }}
        />
        <TextField
          size="small"
          type="date"
          label="To Date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: fromDate || undefined }}
          sx={{ width: 170 }}
        />
        <Button
          variant="contained"
          size="medium"
          startIcon={<SearchIcon />}
          onClick={handleDateSearch}
        >
          Search
        </Button>
        <SelectFilter
          label="Type"
          value={typeFilter}
          onChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
          options={FOLLOW_UP_TYPES}
        />
        <SelectFilter
          label="Status"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={FOLLOW_UP_STATUSES}
        />
      </Box>

      <DataTable
        title="Follow-ups"
        columns={columns}
        data={rows}
        totalRows={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        searchValue={search}
        onSearch={handleSearch}
        onSort={(field, dir) => {
          setSortBy(field);
          setSortOrder(dir);
        }}
        tableKey="followups"
        exportFilename="followups"
        paginationServer
        loading={isLoading}
      />
    </Box>
  );
}
