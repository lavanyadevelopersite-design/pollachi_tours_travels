import { useCallback, useMemo, useState } from 'react';
import { Box, TextField } from '@mui/material';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import Loader from '../../components/common/Loader';
import SelectFilter from '../../components/common/SelectFilter';
import { useAuditLogs } from '../../hooks/queries/useAuditLogs';
import { formatDateTime } from '../../utils/formatters';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '../../utils/constants';

export default function AuditLogList() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    if (moduleFilter) params.module = moduleFilter;
    if (actionFilter) params.action = actionFilter;
    return params;
  }, [page, perPage, search, fromDate, toDate, sortBy, sortOrder, moduleFilter, actionFilter]);

  const { data, isLoading } = useAuditLogs(listParams);
  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'sno',
        name: 'S.No',
        width: '70px',
        cell: (_row, index) => (page - 1) * perPage + index + 1,
      },
      {
        id: 'created_at',
        name: 'Date & Time',
        selector: (r) => formatDateTime(r.created_at || r.createdAt),
        sortable: true,
        sortField: 'created_at',
        minWidth: '170px',
      },
      {
        id: 'user',
        name: 'User',
        selector: (r) => {
          if (r.user) {
            const name = [r.user.first_name, r.user.last_name].filter(Boolean).join(' ');
            return name || r.user.email || '—';
          }
          return r.user_name || '—';
        },
      },
      {
        id: 'action',
        name: 'Action',
        selector: (r) => r.action || '—',
        sortable: true,
        sortField: 'action',
      },
      {
        id: 'module',
        name: 'Module',
        selector: (r) => r.module || '—',
        sortable: true,
        sortField: 'module',
      },
      {
        id: 'details',
        name: 'Details',
        selector: (r) => r.description || r.details || '—',
        grow: 1,
      },
      {
        id: 'ip',
        name: 'IP',
        selector: (r) => r.ip_address || r.ip || '—',
      },
    ],
    [page, perPage]
  );

  const filters = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        flexShrink: 0,
      }}
    >
      <TextField
        size="small"
        type="date"
        label="From Date"
        value={fromDate}
        onChange={(e) => {
          setFromDate(e.target.value);
          setPage(1);
        }}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 170, flexShrink: 0 }}
      />
      <TextField
        size="small"
        type="date"
        label="To Date"
        value={toDate}
        onChange={(e) => {
          setToDate(e.target.value);
          setPage(1);
        }}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: fromDate || undefined }}
        sx={{ width: 170, flexShrink: 0 }}
      />
      <SelectFilter
        label="Module"
        value={moduleFilter}
        onChange={(v) => {
          setModuleFilter(v);
          setPage(1);
        }}
        options={AUDIT_MODULES}
        minWidth={150}
      />
      <SelectFilter
        label="Action"
        value={actionFilter}
        onChange={(v) => {
          setActionFilter(v);
          setPage(1);
        }}
        options={AUDIT_ACTIONS}
        minWidth={140}
      />
    </Box>
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader title="Audit Logs" subtitle="Track user actions across the system" />
      <DataTable
        title="Audit Logs"
        columns={columns}
        data={rows}
        totalRows={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
        searchValue={search}
        onSearch={handleSearch}
        onSort={(field, direction) => {
          setSortBy(field);
          setSortOrder(direction);
        }}
        tableKey="audit-logs"
        exportFilename="audit-logs"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
    </Box>
  );
}
