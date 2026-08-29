import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import { usePermission } from '../../hooks/usePermission';
import { usePaymentModes, usePaymentModeMutation } from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';

export default function PaymentModeList() {
  const navigate = useNavigate();
  const canCreate = usePermission('payment_modes.create');
  const canEdit = usePermission('payment_modes.edit');
  const canDelete = usePermission('payment_modes.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('display_order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteId, setDeleteId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter === 'active') params.is_active = true;
    if (statusFilter === 'inactive') params.is_active = false;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter]);

  const { data, isLoading } = usePaymentModes(listParams);
  const { remove, updateStatus } = usePaymentModeMutation();
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
      { id: 'name', name: 'Payment Mode', selector: (r) => r.name, sortable: true, sortField: 'name' },
      {
        id: 'display_order',
        name: 'Display Order',
        selector: (r) => r.display_order,
        sortable: true,
        sortField: 'display_order',
      },
      { id: 'icon', name: 'Icon', selector: (r) => r.icon || '—' },
      {
        id: 'status',
        name: 'Status',
        cell: (r) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusBadge status={activeStatus(r)} />
            {canEdit && (
              <Switch
                size="small"
                checked={r.is_active !== false}
                onChange={() =>
                  updateStatus.mutate({ id: r.id, is_active: !(r.is_active !== false) })
                }
              />
            )}
          </Box>
        ),
      },
      {
        id: 'actions',
        name: 'Actions',
        width: '120px',
        omitExport: true,
        cell: (row) => (
          <Box>
            {canEdit && (
              <Tooltip title="Edit"><IconButton
                  size="small" color="warning"
                  onClick={() => navigate(`/masters/payment-modes/edit/${row.id}`)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canEdit, canDelete, navigate, page, perPage, updateStatus]
  );

  const filters = (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel id="payment-mode-status-filter">Status</InputLabel>
      <Select
        labelId="payment-mode-status-filter"
        value={statusFilter}
        label="Status"
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </Select>
    </FormControl>
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Payment Mode"
        subtitle="Manage available payment methods"
        actionLabel={canCreate ? 'Add Payment Mode' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/payment-modes/create')}
      />
      <DataTable
        title="Payment Mode"
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
        tableKey="payment-modes"
        exportFilename="payment-modes"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Payment Mode"
        message="Are you sure you want to delete this payment mode?"
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
