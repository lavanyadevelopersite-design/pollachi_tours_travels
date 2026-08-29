import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import { usePermission } from '../../hooks/usePermission';
import {
  useInclusionExclusions,
  useInclusionExclusionMutation,
} from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';

export default function InclusionExclusionList() {
  const navigate = useNavigate();
  const canCreate = usePermission('inclusion_exclusions.create');
  const canEdit = usePermission('inclusion_exclusions.edit');
  const canDelete = usePermission('inclusion_exclusions.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter === 'active') params.is_active = true;
    if (statusFilter === 'inactive') params.is_active = false;
    if (typeFilter) params.type = typeFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter, typeFilter]);

  const { data, isLoading } = useInclusionExclusions(listParams);
  const { remove, updateStatus } = useInclusionExclusionMutation();
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
        id: 'type',
        name: 'Type',
        width: '130px',
        cell: (r) => (
          <Chip
            size="small"
            label={r.type === 'exclusion' ? 'Exclusion' : 'Inclusion'}
            sx={{
              fontWeight: 700,
              bgcolor: r.type === 'exclusion' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.14)',
              color: r.type === 'exclusion' ? '#b91c1c' : '#15803d',
            }}
          />
        ),
      },
      {
        id: 'heading',
        name: 'Heading',
        selector: (r) => r.heading,
        sortable: true,
        sortField: 'heading',
      },
      {
        id: 'description',
        name: 'Description',
        grow: 2,
        cell: (r) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 360 }}>
            {r.description || '—'}
          </Typography>
        ),
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
        width: '120px',
        omitExport: true,
        cell: (row) => (
          <Box>
            {canEdit && (
              <Tooltip title="Edit"><IconButton
                  size="small" color="warning"
                  onClick={() => navigate(`/masters/inclusion-exclusions/edit/${row.id}`)}
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
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={typeFilter}
          label="Type"
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="inclusion">Inclusion</MenuItem>
          <MenuItem value="exclusion">Exclusion</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
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
    </Box>
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Inclusions & Exclusions"
        subtitle="Master list used in itinerary Final preview"
        actionLabel={canCreate ? 'Add Item' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/inclusion-exclusions/create')}
      />
      <DataTable
        title="Inclusions & Exclusions"
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
        tableKey="inclusion-exclusions"
        exportFilename="inclusion-exclusions"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Item"
        message="Are you sure you want to delete this inclusion / exclusion?"
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
