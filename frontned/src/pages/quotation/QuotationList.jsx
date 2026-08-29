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
import { useQuotations } from '../../hooks/queries/useQuotations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { QUOTATION_STATUSES } from '../../utils/constants';

function userName(user) {
  if (!user) return '—';
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  return name || user.email || '—';
}

export default function QuotationList() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [appliedFrom, setAppliedFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [appliedTo, setAppliedTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState('');

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (appliedFrom) params.from = appliedFrom;
    if (appliedTo) params.to = appliedTo;
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, appliedFrom, appliedTo, statusFilter]);

  const { data, isLoading } = useQuotations(listParams);
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
        width: '140px',
        omitExport: true,
        cell: (row) => {
          if (!row.enquiry_id || !row.itinerary_id) {
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
                  `/enquiry/${row.enquiry_id}/quotation/${row.itinerary_id || 'direct'}`,
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
              View Quotation
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
        id: 'quotation_code',
        name: 'Quote #',
        selector: (r) => r.quotation_code || '—',
        sortable: true,
        sortField: 'quotation_code',
        minWidth: '140px',
        cell: (r) => (
          <Typography variant="body2" fontWeight={700}>
            {r.quotation_code || '—'}
          </Typography>
        ),
      },
      {
        id: 'customerName',
        name: 'Customer',
        selector: (r) => r.customer_name || r.enquiry?.customer_name || '—',
        minWidth: '140px',
        grow: 1,
      },
      {
        id: 'travelDates',
        name: 'Travel Dates',
        minWidth: '220px',
        width: '220px',
        grow: 0,
        cell: (r) => {
          const from = r.travel_from || r.itinerary?.from_date;
          const to = r.travel_to || r.itinerary?.to_date;
          if (!from && !to) return '—';
          return (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              {formatDate(from)} – {formatDate(to)}
            </Typography>
          );
        },
      },
      {
        id: 'total_amount',
        name: 'Amount',
        selector: (r) => formatCurrency(r.total_amount),
        sortable: true,
        sortField: 'total_amount',
        minWidth: '120px',
      },
      {
        id: 'status',
        name: 'Status',
        width: '120px',
        sortable: true,
        sortField: 'status',
        cell: (r) => <StatusBadge status={r.status || 'draft'} />,
      },
      {
        id: 'assignedTo',
        name: 'Assigned To',
        selector: (r) => {
          const name = userName(r.assignee);
          return name !== '—' ? name : userName(r.enquiry?.assignee);
        },
        minWidth: '130px',
      },
      {
        id: 'createdBy',
        name: 'Created By',
        selector: (r) => userName(r.creator),
        minWidth: '130px',
      },
      {
        id: 'created_at',
        name: 'Created',
        selector: (r) => formatDate(r.created_at || r.createdAt),
        sortable: true,
        sortField: 'created_at',
        minWidth: '120px',
      },
    ],
    [page, perPage]
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader title="Quotations" subtitle="Enquiry quotations and pricing" />

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
          label="Status"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={QUOTATION_STATUSES}
        />
      </Box>

      <DataTable
        title="Quotations"
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
        tableKey="quotations"
        exportFilename="quotations"
        paginationServer
        loading={isLoading}
      />
    </Box>
  );
}
