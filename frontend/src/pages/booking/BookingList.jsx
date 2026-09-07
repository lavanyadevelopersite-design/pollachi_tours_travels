import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import SelectFilter from '../../components/common/SelectFilter';
import { usePermission } from '../../hooks/usePermission';
import { useBookings, useBookingMutation } from '../../hooks/queries/useBookings';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { BOOKING_STATUSES } from '../../utils/constants';

export default function BookingList() {
  const navigate = useNavigate();
  const canCreate = usePermission('bookings.create');
  const canEdit = usePermission('bookings.edit');
  const canDelete = usePermission('bookings.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter]);

  const { data, isLoading } = useBookings(listParams);
  const { remove } = useBookingMutation();

  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'bookingNo',
        name: 'Booking #',
        selector: (r) => r.booking_code || r.bookingNo,
      },
      {
        id: 'customerName',
        name: 'Customer',
        selector: (r) => r.customer_name || r.customerName,
      },
      {
        id: 'travelDate',
        name: 'Travel From',
        selector: (r) => formatDate(r.travel_from || r.travelDate),
      },
      {
        id: 'totalAmount',
        name: 'Total',
        selector: (r) => formatCurrency(r.total_amount ?? r.totalAmount),
      },
      {
        id: 'paidAmount',
        name: 'Paid',
        selector: (r) => formatCurrency(r.paid_amount ?? r.paidAmount),
      },
      { id: 'status', name: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
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
                  onClick={() => navigate(`/bookings/edit/${row.id}`)}
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
    [canEdit, canDelete, navigate]
  );

  const filters = (
    <SelectFilter
      label="Status"
      value={statusFilter}
      onChange={(v) => {
        setStatusFilter(v);
        setPage(1);
      }}
      options={BOOKING_STATUSES}
    />
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Bookings"
        subtitle="Confirmed tour bookings"
        actionLabel={canCreate ? 'Add Booking' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/bookings/create')}
      />
      <DataTable
        title="Bookings"
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
        tableKey="bookings"
        exportFilename="bookings"
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
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
