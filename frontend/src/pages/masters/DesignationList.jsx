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
  useDepartments,
  useDesignations,
  useDesignationMutation,
} from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

export default function DesignationList() {
  const navigate = useNavigate();
  const canCreate = usePermission('designations.create');
  const canEdit = usePermission('designations.edit');
  const canDelete = usePermission('designations.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);

  const { data: departmentData } = useDepartments({ page: 1, perPage: 300, is_active: true });

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter === 'active') params.is_active = true;
    if (statusFilter === 'inactive') params.is_active = false;
    if (departmentFilter) params.department_id = departmentFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter, departmentFilter]);

  const { data, isLoading } = useDesignations(listParams);
  const { remove, updateStatus } = useDesignationMutation();
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
        id: 'designation_code',
        name: 'Designation Code',
        selector: (r) => r.designation_code || '—',
        sortable: true,
        sortField: 'designation_code',
      },
      {
        id: 'designation_name',
        name: 'Designation Name',
        selector: (r) => r.designation_name,
        sortable: true,
        sortField: 'designation_name',
      },
      {
        id: 'department',
        name: 'Department',
        selector: (r) => r.department?.department_name || '—',
      },
      {
        id: 'hierarchy_level',
        name: 'Hierarchy Level',
        selector: (r) =>
          r.hierarchy_level === null || r.hierarchy_level === undefined
            ? '—'
            : r.hierarchy_level,
        sortable: true,
        sortField: 'hierarchy_level',
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
                  onClick={() => navigate(`/masters/designations/edit/${row.id}`)}
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
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="designation-department-filter">Department</InputLabel>
        <Select
          labelId="designation-department-filter"
          value={departmentFilter}
          label="Department"
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {(departmentData?.rows || []).map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.department_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="designation-status-filter">Status</InputLabel>
        <Select
          labelId="designation-status-filter"
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
        title="Designation"
        subtitle="Manage employee designations by department"
        actionLabel={canCreate ? 'Add Designation' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/designations/create')}
      />
      <DataTable
        title="Designation"
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
        tableKey="designations"
        exportFilename="designations"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Designation"
        message="Are you sure you want to delete this designation?"
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
