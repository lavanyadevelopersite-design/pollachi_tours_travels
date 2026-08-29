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
import {
  useLeadSourceTypes,
  useLeadSourceTypeMutation,
} from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

export default function LeadSourceTypeList() {
  const navigate = useNavigate();
  const canCreate = usePermission('lead_source_types.create');
  const canEdit = usePermission('lead_source_types.edit');
  const canDelete = usePermission('lead_source_types.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter === 'active') params.is_active = true;
    if (statusFilter === 'inactive') params.is_active = false;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter]);

  const { data, isLoading } = useLeadSourceTypes(listParams);
  const { remove, updateStatus } = useLeadSourceTypeMutation();
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
        id: 'lead_source_type',
        name: 'Lead Source Type',
        selector: (r) => r.lead_source_type,
        sortable: true,
        sortField: 'lead_source_type',
      },
      {
        id: 'description',
        name: 'Description',
        selector: (r) => r.description || '—',
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
        id: 'created_at',
        name: 'Created Date',
        selector: (r) => formatDate(r.created_at),
        sortable: true,
        sortField: 'created_at',
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
                  onClick={() => navigate(`/masters/lead-source-types/edit/${row.id}`)}
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
      <InputLabel id="lead-source-type-filter-label">Status</InputLabel>
      <Select
        labelId="lead-source-type-filter-label"
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
        title="Lead Source Type"
        subtitle="Manage lead sources such as Instagram, Newspaper, and Reference"
        actionLabel={canCreate ? 'Add Lead Source Type' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/lead-source-types/create')}
      />
      <DataTable
        title="Lead Source Type"
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
        tableKey="lead-source-types"
        exportFilename="lead-source-types"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Lead Source Type"
        message="Are you sure you want to delete this lead source type?"
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
