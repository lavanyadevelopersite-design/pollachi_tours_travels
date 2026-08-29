import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, TextField, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import SelectFilter from '../../components/common/SelectFilter';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EXPENSE_STATUSES } from '../../utils/constants';
import { usePermission } from '../../hooks/usePermission';
import { useExpenses, useExpenseMutation } from '../../hooks/queries/useModules';
import { useExpensesTypes } from '../../hooks/queries/useMasters';

export default function ExpenseList() {
  const navigate = useNavigate();
  const canCreate = usePermission('expenses.create');
  const canEdit = usePermission('expenses.edit');
  const canDelete = usePermission('expenses.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('expense_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [appliedFrom, setAppliedFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [appliedTo, setAppliedTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const { data: typesData } = useExpensesTypes({ page: 1, perPage: 200, sortBy: 'name', sortOrder: 'asc' });
  const categoryOptions = useMemo(
    () =>
      (typesData?.rows || [])
        .filter((r) => r.is_active !== false && r.status !== 'inactive')
        .map((r) => ({ value: r.name, label: r.name })),
    [typesData]
  );

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (appliedFrom) params.from = appliedFrom;
    if (appliedTo) params.to = appliedTo;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, appliedFrom, appliedTo, statusFilter, categoryFilter]);

  const { data, isLoading } = useExpenses(listParams);
  const { remove } = useExpenseMutation();

  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((v) => {
    setSearch(v);
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
        id: 'expense_code',
        name: 'Expense #',
        selector: (r) => r.expense_code || '—',
        sortable: true,
        sortField: 'expense_code',
      },
      {
        id: 'category',
        name: 'Category',
        selector: (r) => r.category || '—',
      },
      {
        id: 'title',
        name: 'Title',
        selector: (r) => r.title || '—',
        grow: 1,
      },
      {
        id: 'amount',
        name: 'Amount',
        selector: (r) => formatCurrency(r.amount),
        sortable: true,
        sortField: 'amount',
      },
      {
        id: 'expense_date',
        name: 'Date',
        selector: (r) => formatDate(r.expense_date || r.expenseDate),
        sortable: true,
        sortField: 'expense_date',
      },
      {
        id: 'status',
        name: 'Status',
        cell: (r) => <StatusBadge status={r.status || 'pending'} />,
      },
      {
        id: 'actions',
        name: 'Actions',
        width: '120px',
        omitExport: true,
        cell: (row) => (
          <Box>
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => navigate(`/expenses/edit/${row.id}`)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canEdit, canDelete, navigate]
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Expenses"
        subtitle="Operational expenses"
        actionLabel={canCreate ? 'Add Expense' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/expenses/create')}
      />

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
          label="Category"
          value={categoryFilter}
          onChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
          options={categoryOptions}
          minWidth={180}
        />
        <SelectFilter
          label="Status"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={EXPENSE_STATUSES}
        />
      </Box>

      <DataTable
        title="Expenses"
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
        tableKey="expenses"
        exportFilename="expenses"
        paginationServer
        loading={isLoading}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await remove.mutateAsync(deleteId);
          setDeleteId(null);
        }}
        confirmLabel="Delete"
      />
    </Box>
  );
}
