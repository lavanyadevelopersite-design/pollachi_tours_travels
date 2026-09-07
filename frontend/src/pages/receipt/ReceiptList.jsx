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
import { usePayments } from '../../hooks/queries/useModules';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PAYMENT_STATUSES, PAYMENT_TYPES } from '../../utils/constants';

function userName(user) {
  if (!user) return '—';
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  return name || user.email || '—';
}

export default function ReceiptList() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('payment_date');
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
    if (typeFilter) params.payment_type = typeFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, appliedFrom, appliedTo, statusFilter, typeFilter]);

  // Receipts are enquiry payments (printable receipt page)
  const { data, isLoading } = usePayments(listParams);
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
        id: 'view',
        name: 'View',
        width: '130px',
        omitExport: true,
        cell: (row) => {
          if (!row.enquiry_id || !row.id) {
            return (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            );
          }
          return (
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={() =>
                window.open(
                  `/enquiry/${row.enquiry_id}/payments/${row.id}/receipt`,
                  '_blank'
                )
              }
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                bgcolor: '#d97706',
                color: '#fff',
                '&:hover': { bgcolor: '#b45309' },
              }}
            >
              View Receipt
            </Button>
          );
        },
      },
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
          const code = row.enquiry?.enquiry_code || '—';
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
        id: 'payment_code',
        name: 'Receipt #',
        minWidth: '160px',
        sortable: true,
        sortField: 'payment_code',
        cell: (row) => (
          <Typography variant="body2" fontWeight={700}>
            {row.payment_code || '—'}
          </Typography>
        ),
      },
      {
        id: 'customerName',
        name: 'Customer',
        selector: (r) => r.enquiry?.customer_name || r.quotation?.customer_name || '—',
        minWidth: '140px',
        grow: 1,
      },
      {
        id: 'advance_amount',
        name: 'Amount',
        selector: (r) =>
          formatCurrency(
            (Number(r.advance_amount) || 0) + (Number(r.additional_charges) || 0)
          ),
        sortable: true,
        sortField: 'advance_amount',
        minWidth: '120px',
      },
      {
        id: 'payment_mode',
        name: 'Mode',
        selector: (r) => r.payment_mode || '—',
        minWidth: '110px',
        cell: (r) => (
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {r.payment_mode || '—'}
          </Typography>
        ),
      },
      {
        id: 'payment_type',
        name: 'Type',
        width: '110px',
        cell: (r) => (
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {r.payment_type || '—'}
          </Typography>
        ),
      },
      {
        id: 'status',
        name: 'Status',
        width: '120px',
        sortable: true,
        sortField: 'status',
        cell: (r) => <StatusBadge status={r.status || 'received'} />,
      },
      {
        id: 'assignedTo',
        name: 'Assigned To',
        selector: (r) => userName(r.enquiry?.assignee),
        minWidth: '130px',
      },
      {
        id: 'createdBy',
        name: 'Created By',
        selector: (r) => {
          const name = userName(r.creator);
          return name !== '—' ? name : userName(r.receiver);
        },
        minWidth: '130px',
      },
      {
        id: 'payment_date',
        name: 'Receipt Date',
        selector: (r) => formatDate(r.payment_date),
        sortable: true,
        sortField: 'payment_date',
        minWidth: '120px',
      },
    ],
    [page, perPage]
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader title="Receipts" subtitle="Enquiry payment receipts" />

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
          options={PAYMENT_TYPES}
        />
        <SelectFilter
          label="Status"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={PAYMENT_STATUSES}
        />
      </Box>

      <DataTable
        title="Receipts"
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
        tableKey="receipts"
        exportFilename="receipts"
        paginationServer
        loading={isLoading}
      />
    </Box>
  );
}
