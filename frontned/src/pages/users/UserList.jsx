import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import SelectFilter, { ACTIVE_STATUS_OPTIONS, FilterGroup, applyIsActiveParam } from '../../components/common/SelectFilter';
import { usePermission } from '../../hooks/usePermission';
import { useUsers, useUserMutation } from '../../hooks/queries/useUsers';
import { useRoles } from '../../hooks/queries/useRoles';

export default function UserList() {
  const navigate = useNavigate();
  const canCreate = usePermission('users.create');
  const canEdit = usePermission('users.edit');
  const canDelete = usePermission('users.delete');
  const canView = usePermission('users.view');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    applyIsActiveParam(params, statusFilter);
    if (roleFilter) params.role_id = roleFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter, roleFilter]);

  const { data, isLoading } = useUsers(listParams);
  const { data: rolesData } = useRoles({ page: 1, perPage: 200, sortBy: 'name', sortOrder: 'asc' });
  const roleOptions = useMemo(
    () =>
      (rolesData?.rows || [])
        .filter((r) => r.code !== 'super_admin')
        .map((r) => ({ value: r.id, label: r.name })),
    [rolesData]
  );
  const { remove } = useUserMutation();

  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'name',
        name: 'Name',
        selector: (r) =>
          r.name || [r.first_name, r.last_name].filter(Boolean).join(' ') || '—',
        sortable: true,
        sortField: 'first_name',
      },
      { id: 'email', name: 'Email', selector: (r) => r.email, grow: 1 },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="phone" typographyVariant="body2" />,
      },
      {
        id: 'role',
        name: 'Role',
        selector: (r) => r.role_name || r.role?.name || r.role || '—',
      },
      {
        id: 'branch',
        name: 'Branch',
        selector: (r) => r.branch?.name || r.branch_name || '—',
      },
      {
        id: 'department',
        name: 'Department',
        selector: (r) => r.department?.department_name || '—',
      },
      {
        id: 'designation',
        name: 'Designation',
        selector: (r) => r.designation?.designation_name || '—',
      },
      {
        id: 'status',
        name: 'Status',
        cell: (r) => (
          <StatusBadge status={r.is_active === false ? 'inactive' : 'active'} />
        ),
      },
      {
        id: 'actions',
        name: 'Actions',
        width: '160px',
        omitExport: true,
        cell: (row) => (
          <Box>
            {canView && (
              <Tooltip title="View Profile">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/users/profile/${row.id}`)}
                >
                  <PersonOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Edit"><IconButton
                  size="small" color="warning"
                  onClick={() => navigate(`/users/edit/${row.id}`)}
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
    [canView, canEdit, canDelete, navigate]
  );

  const filters = (
    <FilterGroup>
      <SelectFilter
        label="Role"
        value={roleFilter}
        onChange={(v) => {
          setRoleFilter(v);
          setPage(1);
        }}
        options={roleOptions}
        minWidth={180}
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
        title="Users"
        subtitle="Manage system users and access"
        actionLabel={canCreate ? 'Add User' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/users/create')}
      />
      <DataTable
        title="Users"
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
        tableKey="users"
        exportFilename="users"
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete User"
        message="Are you sure you want to delete this user?"
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
