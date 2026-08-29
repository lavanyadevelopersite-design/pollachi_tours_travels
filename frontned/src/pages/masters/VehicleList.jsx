import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import AssignedTripsDialog from '../../components/masters/AssignedTripsDialog';
import SelectFilter, { ACTIVE_STATUS_OPTIONS, FilterGroup, applyIsActiveParam } from '../../components/common/SelectFilter';
import { usePermission } from '../../hooks/usePermission';
import { useVehicles, useVehicleMutation } from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';
import { resolveMediaUrl } from '../../utils/constants';
import OwnershipTag from '../../components/common/OwnershipTag';

export default function VehicleList() {
  const navigate = useNavigate();
  const canCreate = usePermission('vehicles.create');
  const canEdit = usePermission('vehicles.edit');
  const canDelete = usePermission('vehicles.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [tripTarget, setTripTarget] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    applyIsActiveParam(params, statusFilter);
    if (ownershipFilter) params.ownership = ownershipFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter, ownershipFilter]);

  const { data, isLoading } = useVehicles(listParams);
  const { remove } = useVehicleMutation();
  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'viewTrips',
        name: 'Trips',
        width: '170px',
        omitExport: true,
        cell: (row) => (
          <Button
            size="small"
            variant="contained"
            disableElevation
            onClick={() =>
              setTripTarget({
                type: 'vehicle',
                id: row.id,
                title: row.name || 'Vehicle',
                subtitle: row.registration_number || row.code || '',
              })
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
            Assigned Trips
          </Button>
        ),
      },
      { id: 'name', name: 'Name', selector: (r) => r.name, cell: (r) => (
        <Box>
          <Box sx={{ fontWeight: 600, fontSize: 14 }}>{r.name || '—'}</Box>
          <Box sx={{ mt: 0.4 }}>
            <OwnershipTag record={r} />
          </Box>
        </Box>
      ) },
      {
        id: 'image',
        name: 'Image',
        width: '80px',
        omitExport: true,
        cell: (r) => (
          <Avatar
            src={resolveMediaUrl(r.image) || undefined}
            alt={r.name}
            variant="rounded"
            sx={{ width: 44, height: 32 }}
          />
        ),
      },
      { id: 'type', name: 'Type', selector: (r) => r.type },
      {
        id: 'ownership',
        name: 'Ownership',
        selector: (r) => (r.ownership === 'vendor' ? 'Vendor' : 'Own'),
      },
      {
        id: 'vendor',
        name: 'Vendor',
        selector: (r) => (r.ownership === 'vendor' ? r.supplier?.name || '—' : '—'),
      },
      { id: 'capacity', name: 'Seating Capacity', selector: (r) => r.capacity },
      { id: 'reg', name: 'Registration', selector: (r) => r.registration_number || r.registrationNo },
      { id: 'status', name: 'Status', cell: (r) => <StatusBadge status={activeStatus(r)} /> },
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
                  onClick={() => navigate(`/masters/vehicles/edit/${row.id}`)}
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

  const filters = (
    <FilterGroup>
      <SelectFilter
        label="Ownership"
        value={ownershipFilter}
        onChange={(v) => {
          setOwnershipFilter(v);
          setPage(1);
        }}
        options={[
          { value: 'own', label: 'Own' },
          { value: 'vendor', label: 'Vendor' },
        ]}
      />
      <SelectFilter
        label="Status"
        value={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        options={ACTIVE_STATUS_OPTIONS}
      />
    </FilterGroup>
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Vehicles"
        subtitle="Manage vehicles"
        actionLabel={canCreate ? 'Add Vehicle' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/vehicles/create')}
      />
      <DataTable
        title="Vehicles"
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
        onSort={(f, d) => {
          setSortBy(f);
          setSortOrder(d);
        }}
        tableKey="vehicles"
        exportFilename="vehicles"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle?"
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await remove.mutateAsync(deleteId);
          setDeleteId(null);
        }}
        confirmLabel="Delete"
      />
      <AssignedTripsDialog target={tripTarget} onClose={() => setTripTarget(null)} />
    </Box>
  );
}
