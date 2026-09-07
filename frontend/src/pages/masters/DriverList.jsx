import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import AssignedTripsDialog from '../../components/masters/AssignedTripsDialog';
import { usePermission } from '../../hooks/usePermission';
import { useDrivers, useDriverMutation } from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';
import { resolveMediaUrl } from '../../utils/constants';
import OwnershipTag from '../../components/common/OwnershipTag';

export default function DriverList() {
  const navigate = useNavigate();
  const canCreate = usePermission('drivers.create');
  const canEdit = usePermission('drivers.edit');
  const canDelete = usePermission('drivers.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);
  const [tripTarget, setTripTarget] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter === 'active') params.is_active = true;
    if (statusFilter === 'inactive') params.is_active = false;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter]);

  const { data, isLoading } = useDrivers(listParams);
  const { remove, updateStatus } = useDriverMutation();
  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((value) => {
    setSearch(value);
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
                type: 'driver',
                id: row.id,
                title: row.full_name || 'Driver',
                subtitle: [row.code, row.phone].filter(Boolean).join(' · '),
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
      {
        id: 'sno',
        name: 'S.No',
        width: '70px',
        cell: (_row, index) => (page - 1) * perPage + index + 1,
      },
      {
        id: 'photo',
        name: 'Photo',
        width: '70px',
        cell: (r) => (
          <Avatar src={resolveMediaUrl(r.photo) || undefined} alt={r.full_name} sx={{ width: 36, height: 36 }}>
            {(r.full_name || '?').charAt(0)}
          </Avatar>
        ),
      },
      {
        id: 'code',
        name: 'Code',
        selector: (r) => r.code || '—',
        sortable: true,
        sortField: 'code',
      },
      {
        id: 'full_name',
        name: 'Driver Name',
        selector: (r) => r.full_name,
        sortable: true,
        sortField: 'full_name',
        cell: (r) => (
          <Box>
            <Box sx={{ fontWeight: 600, fontSize: 14 }}>{r.full_name || '—'}</Box>
            <Box sx={{ mt: 0.4 }}>
              <OwnershipTag record={r} />
            </Box>
          </Box>
        ),
      },
      {
        id: 'driver_type',
        name: 'Driver Type',
        selector: (r) => (r.driver_type === 'vendor' ? 'Vendor Vehicle' : 'Own'),
      },
      {
        id: 'vendor',
        name: 'Vendor',
        selector: (r) => (r.driver_type === 'vendor' ? r.supplier?.name || '—' : '—'),
      },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="phone" typographyVariant="body2" />,
      },
      {
        id: 'license_number',
        name: 'License No',
        selector: (r) => r.license_number || '—',
      },
      {
        id: 'availability_status',
        name: 'Availability',
        selector: (r) =>
          (r.availability_status || '—').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      },
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
        width: '150px',
        omitExport: true,
        cell: (row) => (
          <Box>
            <Tooltip title="Documents"><IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/masters/drivers/documents/${row.id}`)}
              >
                <FolderOpenOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title="Edit"><IconButton
                  size="small" color="warning"
                  onClick={() => navigate(`/masters/drivers/edit/${row.id}`)}
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
      <InputLabel id="driver-status-filter">Status</InputLabel>
      <Select
        labelId="driver-status-filter"
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
        title="Drivers"
        subtitle="Manage driver proofs, contacts, and working details"
        actionLabel={canCreate ? 'Add Driver' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/drivers/create')}
      />
      <DataTable
        title="Drivers"
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
        tableKey="drivers"
        exportFilename="drivers"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Driver"
        message="Are you sure you want to delete this driver?"
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
